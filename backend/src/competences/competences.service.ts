import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Competence } from './entities/competence.entity';
import { CreateCompetenceDto } from './dto/create-competence.dto';
import { UpdateCompetenceDto } from './dto/update-competence.dto';
import { FilterCompetenceDto } from './dto/filter-competence.dto';

import { AiService } from '../ai/ai.service';

@Injectable()
export class CompetencesService {
  constructor(
    @InjectRepository(Competence)
    private readonly competenceRepository: Repository<Competence>,
    private readonly aiService: AiService,
  ) {}

  async findAll(filterDto: FilterCompetenceDto): Promise<Competence[]> {
    const where: any = {};

    if (filterDto.categorie) {
      where.categorie = filterDto.categorie;
    }

    if (filterDto.niveau) {
      where.niveau = filterDto.niveau;
    }

    return this.competenceRepository.find({
      where,
      take: filterDto.limit,
      skip: filterDto.offset,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Competence> {
    const competence = await this.competenceRepository.findOne({
      where: { id },
    });

    if (!competence) {
      throw new NotFoundException(`Compétence avec l'id ${id} introuvable`);
    }

    return competence;
  }

  async create(createCompetenceDto: CreateCompetenceDto) {
    try {

      const embedding = await this.aiService.generateEmbedding(
        `${createCompetenceDto.nom} ${createCompetenceDto.description ?? ''}`,
      );

      const competence = this.competenceRepository.create({
        ...createCompetenceDto,
        embedding: embedding as any,
      });

      const result = await this.competenceRepository.save(competence);

      return result;
    } catch (e) {
      throw e;
    }
  }

  async update(
    id: string,
    updateCompetenceDto: UpdateCompetenceDto,
  ): Promise<Competence> {
    const competence = await this.findOne(id);

    Object.assign(competence, updateCompetenceDto);

    return this.competenceRepository.save(competence);
  }
  async remove(id: string): Promise<void> {
    const competence = await this.findOne(id);

    await this.competenceRepository.remove(competence);
  }

  async searchSimilar(query: string) {
    const embedding = await this.aiService.generateEmbedding(query);

    const vector = `[${embedding.join(',')}]`;

    const result = await this.competenceRepository.query(
      `
        SELECT *,
              1 - (embedding <=> $1::vector) AS similarity
        FROM competences
        WHERE embedding IS NOT NULL
          AND 1 - (embedding <=> $1::vector) > 0.7
        ORDER BY embedding <=> $1::vector
        LIMIT 5;
      `,
      [vector],
    );

    return result;
  }

  async generateMissingEmbeddings() {
  const competences = await this.competenceRepository.find({
    where: {
      embedding: IsNull(),
    },
  });

  for (const competence of competences) {
    const embedding = await this.aiService.generateEmbedding(
      `${competence.nom} ${competence.description ?? ''}`,
    );

    competence.embedding = embedding as any;

    await this.competenceRepository.save(competence);

  }

  return {
    count: competences.length,
    message: 'Embeddings manquants générés avec succès',
  };
}
}