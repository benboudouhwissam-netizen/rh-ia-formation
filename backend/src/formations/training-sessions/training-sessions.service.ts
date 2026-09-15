import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrainingSession } from '../entities/training-session.entity';
import { Enrollment } from '../entities/enrollment.entity';

import { CreateTrainingSessionDto } from '../dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../dto/update-training-session.dto';
import { FilterTrainingSessionDto } from '../dto/filter-training-session.dto';

@Injectable()
export class TrainingSessionsService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  private async withRemainingPlaces(sessions: TrainingSession[], enumerable = true) {
    return Promise.all(sessions.map(async (session) => {
      const inscrits = await this.enrollmentRepository.count({
        where: { training_session_id: session.id },
      });
      Object.defineProperty(session, 'places_restantes', {
        value: session.capacite == null ? null : Math.max(0, session.capacite - inscrits),
        enumerable,
        configurable: true,
        writable: true,
      });
      return session;
    }));
  }

  async findAll(filterDto: FilterTrainingSessionDto) {
    const limit = filterDto.limit ?? 10;
    const offset = filterDto.offset ?? 0;

    const queryBuilder = this.trainingSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.formation', 'formation');

    if (filterDto.formation_id) {
      queryBuilder.andWhere(
        'session.formation_id = :formation_id',
        {
          formation_id: filterDto.formation_id,
        },
      );
    }

    if (filterDto.statut) {
      queryBuilder.andWhere(
        'session.statut = :statut',
        {
          statut: filterDto.statut,
        },
      );
    }

    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('session.date_debut', 'DESC');

    const [data, total] =
      await queryBuilder.getManyAndCount();

    return {
      data: await this.withRemainingPlaces(data, true),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const trainingSession =
      await this.trainingSessionRepository.findOne({
        where: { id },
        relations: {
          formation: true,
        },
      });

    if (!trainingSession) {
      throw new NotFoundException(
        `Training session with ID ${id} not found`,
      );
    }

    return (await this.withRemainingPlaces([trainingSession], false))[0];
  }

  async create(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    try {
      const trainingSession =
        this.trainingSessionRepository.create(
          createTrainingSessionDto,
        );

      return await this.trainingSessionRepository.save(
        trainingSession,
      );
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateDto: UpdateTrainingSessionDto,
  ) {
    const trainingSession = await this.findOne(id);

    Object.assign(trainingSession, updateDto);

    return this.trainingSessionRepository.save(
      trainingSession,
    );
  }

  async remove(id: string) {
    const trainingSession = await this.findOne(id);

    await this.trainingSessionRepository.remove(
      trainingSession,
    );

    return {
      message: 'Training session deleted successfully',
    };
  }
}
