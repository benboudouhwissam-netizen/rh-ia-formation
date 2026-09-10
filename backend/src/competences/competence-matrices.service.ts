import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompetenceMatrice } from './entities/competence-matrice.entity';

@Injectable()
export class CompetenceMatricesService {
  constructor(
    @InjectRepository(CompetenceMatrice)
    private readonly competenceMatriceRepository: Repository<CompetenceMatrice>,
  ) {}

  async findByPoste(
    posteId: string,
  ): Promise<CompetenceMatrice[]> {
    return this.competenceMatriceRepository.find({
      where: {
        poste_id: posteId,
      },
      relations: {
        competence: true,
      },
    });
  }

  async findOne(id: string): Promise<CompetenceMatrice> {
    const matrice =
      await this.competenceMatriceRepository.findOne({
        where: { id },
        relations: {
          competence: true,
        },
      });

    if (!matrice) {
      throw new NotFoundException(
        `Matrice de compétence avec l'id ${id} introuvable`,
      );
    }

    return matrice;
  }

  async getEcartsParPoste(posteId: string) {
    const requises = await this.competenceMatriceRepository.find({
      where: { poste_id: posteId },
      relations: { competence: true },
    });

    const resultats = await Promise.all(
      requises.map(async (req) => {
        const evaluations = await this.competenceMatriceRepository.query(
          `SELECT ec.niveau
           FROM employee_competences ec
           JOIN employee_accounts ea ON ea.id = ec.utilisateur_id
           WHERE ec.competence_id = $1 AND ea.poste_id = $2
             AND ea.nom_complet NOT ILIKE 'Test %'
             AND ea.nom_complet NOT ILIKE 'Collaborateur interne'`,
          [req.competence_id, posteId],
        );
        const niveaux = evaluations.map((e: any) => e.niveau);
        const moyenne = niveaux.length
          ? niveaux.reduce((a: number, b: number) => a + b, 0) / niveaux.length
          : 0;
        const enEcart = niveaux.filter((n: number) => n < req.niveau_requis).length;

        return {
          competence_id: req.competence_id,
          competence_nom: req.competence?.nom,
          niveau_requis: req.niveau_requis,
          niveau_moyen_observe: Number(moyenne.toFixed(2)),
          ecart_moyen: Number((req.niveau_requis - moyenne).toFixed(2)),
          collaborateurs_en_ecart: enEcart,
          collaborateurs_evalues: niveaux.length,
        };
      }),
    );

    return { poste_id: posteId, competences: resultats };
  }

  async listPostesDistincts(): Promise<string[]> {
    const rows = await this.competenceMatriceRepository
      .createQueryBuilder('matrice')
      .select('DISTINCT matrice.poste_id', 'poste_id')
      .getRawMany();
    return rows.map((r) => r.poste_id);
  }
}
