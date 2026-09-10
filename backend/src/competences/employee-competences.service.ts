import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeCompetence } from './entities/employee-competence.entity';
import { EmployeeAccount } from '../auth/entities/employee-account.entity';
import { CreateEmployeeCompetenceDto } from './dto/create-employee-competence.dto';
import { PerformanceEventsService } from '../formations/performance-events/performance-events.service';

@Injectable()
export class EmployeeCompetencesService {
  constructor(
    @InjectRepository(EmployeeCompetence)
    private readonly employeeCompetenceRepository: Repository<EmployeeCompetence>,
    @InjectRepository(EmployeeAccount)
    private readonly employeeAccountRepository: Repository<EmployeeAccount>,
    private readonly performanceEventsService: PerformanceEventsService,
  ) {}

  async findByUtilisateur(
    utilisateurId: string,
  ): Promise<EmployeeCompetence[]> {
    const competences =
      await this.employeeCompetenceRepository.find({
        where: {
          utilisateur_id: utilisateurId,
        },
        order: {
          date_evaluation: 'DESC',
        },
      });

    return competences;
  }

  async findOne(id: string): Promise<EmployeeCompetence> {
    const competence =
      await this.employeeCompetenceRepository.findOne({
        where: { id },
      });

    if (!competence) {
      throw new NotFoundException(
        `Compétence employé avec l'id ${id} introuvable`,
      );
    }

    return competence;
  }

  async createOrUpdate(createDto: CreateEmployeeCompetenceDto) {
    const existing = await this.employeeCompetenceRepository.findOne({
      where: {
        utilisateur_id: createDto.utilisateur_id,
        competence_id: createDto.competence_id,
      },
    });

    const saved = await this.employeeCompetenceRepository.save(
      existing
        ? Object.assign(existing, { ...createDto, date_evaluation: new Date() })
        : this.employeeCompetenceRepository.create({
            ...createDto,
            source: createDto.source ?? 'auto_evalue',
            date_evaluation: new Date(),
          }),
    );
    await this.performanceEventsService.publish({
      utilisateur_id: saved.utilisateur_id,
      type: 'competence_mise_a_jour',
      reference_id: null,
      payload: { competence_id: saved.competence_id, niveau: saved.niveau, source: saved.source },
    });
    return saved;
  }

  async remove(id: string) {
    const competence = await this.findOne(id);
    await this.employeeCompetenceRepository.remove(competence);
    return { message: 'Employee competence deleted successfully' };
  }

  async getMatrix(): Promise<{
    utilisateurs: string[];
    employes: { id: string; nom_complet: string }[];
    competences: { id: string; nom: string }[];
    cellules: { utilisateur_id: string; competence_id: string; niveau: number }[];
  }> {
    const rows = await this.employeeCompetenceRepository.find({
      relations: { competence: true },
    });

    // La matrice est une vue RH globale : elle ne dépend pas de la session
    // de l'employé actuellement connecté. On inclut donc tous les comptes
    // employés, y compris ceux qui n'ont pas encore de compétence évaluée.
    const accounts = await this.employeeAccountRepository.find({
      select: { id: true, nom_complet: true },
      order: { nom_complet: 'ASC', id: 'ASC' },
    });
    const rowCounts = new Map<string, number>();
    rows.forEach((row) => rowCounts.set(row.utilisateur_id, (rowCounts.get(row.utilisateur_id) ?? 0) + 1));
    const accountByName = new Map<string, EmployeeAccount>();
    for (const account of accounts) {
      const key = account.nom_complet.trim().toLocaleLowerCase();
      const current = accountByName.get(key);
      if (!current || (rowCounts.get(account.id) ?? 0) > (rowCounts.get(current.id) ?? 0)) {
        accountByName.set(key, account);
      }
    }
    const canonicalAccounts = Array.from(accountByName.values()).filter((account) => {
      const name = account.nom_complet.trim();
      return !/^test\b/i.test(name) && !/^collaborateur interne$/i.test(name);
    });
    const utilisateurs = canonicalAccounts.map((account) => account.id);
    const employes = canonicalAccounts.map((account) => ({ id: account.id, nom_complet: account.nom_complet }));
    const canonicalIds = new Set(utilisateurs);

    const competencesMap = new Map<string, string>();
    rows.filter((r) => canonicalIds.has(r.utilisateur_id)).forEach((r) => competencesMap.set(r.competence_id, r.competence?.nom ?? r.competence_id));
    const competences = Array.from(competencesMap.entries()).map(([id, nom]) => ({ id, nom }));

    const cellules = rows.filter((r) => canonicalIds.has(r.utilisateur_id)).map((r) => ({
      utilisateur_id: r.utilisateur_id,
      competence_id: r.competence_id,
      niveau: r.niveau,
    }));

    return { utilisateurs, employes, competences, cellules };
  }

  async getTopExperts(limit = 5) {
  const classement = await this.employeeCompetenceRepository.query(
    `
    SELECT competence_id, competence_nom, utilisateur_id, utilisateur_nom, niveau, rang
    FROM (
      SELECT
        ec.competence_id,
        c.nom AS competence_nom,
        ec.utilisateur_id,
        ea.nom_complet AS utilisateur_nom,
        ec.niveau,
        ROW_NUMBER() OVER (PARTITION BY ec.competence_id ORDER BY ec.niveau DESC) AS rang
      FROM employee_competences ec
      JOIN competences c ON c.id = ec.competence_id
      JOIN employee_accounts ea ON ea.id = ec.utilisateur_id
      WHERE NOT (ea.nom_complet ILIKE 'Test %' OR ea.nom_complet ILIKE 'Collaborateur interne')
    ) ranked
    WHERE rang <= $1
    ORDER BY competence_nom, rang
    `,
    [limit],
  );

  const competenceIds = [...new Set(classement.map((r: any) => r.competence_id))];

  const certifications = competenceIds.length
    ? await this.employeeCompetenceRepository.query(
        `SELECT utilisateur_id, competence_id, nom_certification, organisme, date_obtention
         FROM certifications
         WHERE competence_id = ANY($1::uuid[])`,
        [competenceIds],
      )
    : [];

  const parCompetence = new Map<string, any>();
    for (const row of classement) {
      if (!parCompetence.has(row.competence_id)) {
        parCompetence.set(row.competence_id, {
          competence_id: row.competence_id,
          competence_nom: row.competence_nom,
          experts: [],
        });
      }
      const certifs = certifications.filter(
        (c: any) => c.utilisateur_id === row.utilisateur_id && c.competence_id === row.competence_id,
      );
      parCompetence.get(row.competence_id).experts.push({
        utilisateur_id: row.utilisateur_id,
        nom_complet: row.utilisateur_nom,
        niveau: row.niveau,
        certifications: certifs.map((c: any) => ({
          nom: c.nom_certification,
          organisme: c.organisme,
          date_obtention: c.date_obtention,
        })),
      });
    }

    return Array.from(parCompetence.values());
  }
}
