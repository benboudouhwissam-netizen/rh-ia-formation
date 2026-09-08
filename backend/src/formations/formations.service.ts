import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Formation } from './entities/formation.entity';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { FilterFormationDto } from './dto/filter-formation.dto';

import { Competence } from '../competences/entities/competence.entity';
import { FormationCompetence } from './entities/formation-competence.entity';

import { AiService } from '../ai/ai.service';

@Injectable()
export class FormationsService {
  constructor(
    @InjectRepository(Formation)
    private readonly formationRepository: Repository<Formation>,

    @InjectRepository(Competence)
    private readonly competenceRepository: Repository<Competence>,

    @InjectRepository(FormationCompetence)
    private readonly formationCompetenceRepository: Repository<FormationCompetence>,

    private readonly aiService: AiService,
  ) {}

  async findAll(
    filterDto: FilterFormationDto,
  ): Promise<Formation[]> {
    const where: any = {};

    if (filterDto.categorie) {
      where.categorie = filterDto.categorie;
    }

    if (filterDto.niveau) {
      where.niveau = filterDto.niveau;
    }

    if (filterDto.statut) {
      where.statut = filterDto.statut;
    }

    return this.formationRepository.find({
      where,
      take: filterDto.limit,
      skip: filterDto.offset,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Formation> {
    const formation = await this.formationRepository.findOne({
      where: { id },
    });

    if (!formation) {
      throw new NotFoundException(
        `Formation avec l'id ${id} introuvable`,
      );
    }

    return formation;
  }

  async create(
    createFormationDto: CreateFormationDto,
  ): Promise<Formation> {
    const formation = this.formationRepository.create(
      createFormationDto,
    );

    return this.formationRepository.save(formation);
  }

  async update(
    id: string,
    updateFormationDto: UpdateFormationDto,
  ): Promise<Formation> {
    const formation = await this.findOne(id);

    Object.assign(formation, updateFormationDto);

    return this.formationRepository.save(formation);
  }

  async remove(id: string): Promise<void> {
    const formation = await this.findOne(id);

    await this.formationRepository.remove(formation);
  }

  async generateEmbedding(id: string): Promise<Formation> {
    const formation = await this.findOne(id);

    const liens = await this.formationCompetenceRepository.find({
      where: { formation_id: id },
      relations: { competence: true },
    });

    const competencesTexte = liens
      .map((lien) => lien.competence?.nom)
      .filter(Boolean)
      .join(', ');

    const text = `
      Titre : ${formation.titre}
      Description : ${formation.description ?? ''}
      Catégorie : ${formation.categorie ?? ''}
      Niveau : ${formation.niveau ?? ''}
      Durée : ${formation.duree ?? ''}
      Statut : ${formation.statut ?? ''}
      Compétences requises : ${competencesTexte || 'non spécifiées'}
      `.trim();

    const embedding = await this.aiService.generateEmbedding(text);

    formation.embedding = embedding;

    return this.formationRepository.save(formation);
  }

  async lierCompetence(
    formationId: string,
    competenceId: string,
    niveauVise?: number,
  ): Promise<FormationCompetence> {
    await this.findOne(formationId); // vérifie que la formation existe

    // La liaison peut déjà provenir du catalogue recommandé. Rendre
    // l'opération idempotente évite une erreur SQL de contrainte unique et
    // permet à un parcours E2E de compléter une formation existante.
    const lienExistant = await this.formationCompetenceRepository.findOne({
      where: {
        formation_id: formationId,
        competence_id: competenceId,
      },
    });

    if (lienExistant) {
      if (niveauVise !== undefined && lienExistant.niveau_vise !== niveauVise) {
        lienExistant.niveau_vise = niveauVise;
        return this.formationCompetenceRepository.save(lienExistant);
      }
      return lienExistant;
    }

    const lien = this.formationCompetenceRepository.create({
      formation_id: formationId,
      competence_id: competenceId,
      niveau_vise: niveauVise,
    });

    return this.formationCompetenceRepository.save(lien);
  }

  async searchSimilarFormations(competenceId: string) {
    const competence = await this.competenceRepository.findOne({
      where: { id: competenceId },
    });

    if (!competence) {
      throw new NotFoundException(
        `Compétence avec l'id ${competenceId} introuvable`,
      );
    }

    if (!competence.embedding) {
      throw new NotFoundException(
        `La compétence ${competence.nom} ne possède pas encore d'embedding`,
      );
    }

    const vector = `[${competence.embedding.join(',')}]`;

    const formations = await this.formationRepository.query(
      `
        SELECT
          f.id,
          f.titre,
          f.description,
          f.categorie,
          f.duree,
          f.statut,
          f.created_at,
          f.updated_at,
          f.niveau,
          1 - (f.embedding <=> $1::vector) AS similarity
        FROM formations f
        WHERE f.embedding IS NOT NULL
        ORDER BY f.embedding <=> $1::vector
        LIMIT 5;
      `,
      [vector],
    );

    return formations;
  }

  async generateMissingEmbeddings(): Promise<{ traitees: number; formations: string[] }> {
    const sansEmbedding = await this.formationRepository
      .createQueryBuilder('formation')
      .where('formation.embedding IS NULL')
      .getMany();

    const titres: string[] = [];
    for (const formation of sansEmbedding) {
      await this.generateEmbedding(formation.id);
      titres.push(formation.titre);
    }

    return { traitees: titres.length, formations: titres };
  }
}
