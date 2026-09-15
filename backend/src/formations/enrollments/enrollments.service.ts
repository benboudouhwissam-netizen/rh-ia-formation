import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Enrollment } from '../entities/enrollment.entity';
import { TrainingSession } from '../entities/training-session.entity';

import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { FilterEnrollmentDto } from '../dto/filter-enrollment.dto';
import { LearningTasksService } from '../learning-tasks/learning-tasks.service';
import { PerformanceEventsService } from '../performance-events/performance-events.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
    private readonly learningTasksService: LearningTasksService,
    private readonly performanceEventsService: PerformanceEventsService,
  ) {}

  async findAll(filterDto: FilterEnrollmentDto) {
    const limit = filterDto.limit ?? 10;
    const offset = filterDto.offset ?? 0;

    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect(
        'enrollment.training_session',
        'training_session',
      )
      .leftJoinAndSelect('training_session.formation', 'formation');

    if (filterDto.utilisateur_id) {
      queryBuilder.andWhere(
        'enrollment.utilisateur_id = :utilisateur_id',
        {
          utilisateur_id: filterDto.utilisateur_id,
        },
      );
    }

    if (filterDto.training_session_id) {
      queryBuilder.andWhere(
        'enrollment.training_session_id = :training_session_id',
        {
          training_session_id:
            filterDto.training_session_id,
        },
      );
    }

    if (filterDto.statut) {
      queryBuilder.andWhere(
        'enrollment.statut = :statut',
        {
          statut: filterDto.statut,
        },
      );
    }

    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy(
        'enrollment.date_inscription',
        'DESC',
      );

    const [data, total] =
      await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const enrollment =
      await this.enrollmentRepository.findOne({
        where: { id },
        relations: {
          training_session: true,
        },
      });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${id} not found`,
      );
    }

    return enrollment;
  }

  async create(createDto: CreateEnrollmentDto) {
    const existing =
      await this.enrollmentRepository.findOne({
        where: {
          utilisateur_id:
            createDto.utilisateur_id,
          training_session_id:
            createDto.training_session_id,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Employee is already enrolled in this training session',
      );
    }

    const session = await this.trainingSessionRepository.findOne({
      where: { id: createDto.training_session_id },
    });
    if (!session) {
      throw new NotFoundException('Training session not found');
    }
    if (session.capacite != null) {
      const inscrits = await this.enrollmentRepository.count({
        where: { training_session_id: session.id },
      });
      if (inscrits >= session.capacite) {
        throw new ConflictException('Cette session est complète');
      }
    }

    const enrollment =
      this.enrollmentRepository.create({
        utilisateur_id:
          createDto.utilisateur_id,

        training_session_id:
          createDto.training_session_id,

        date_inscription:
          new Date(createDto.date_inscription),

        statut:
          createDto.statut ?? 'inscrit',

        nom_complet: createDto.nom_complet?.trim() || null,

        email_professionnel: createDto.email_professionnel?.trim().toLowerCase() || null,
      });

    const saved = await this.enrollmentRepository.save(enrollment);
    await this.learningTasksService.create({
      utilisateur_id: saved.utilisateur_id,
      type: 'suivre_formation',
      reference_id: saved.id,
      message: 'Inscription confirmée : suivre la formation planifiée.',
      payload: { training_session_id: saved.training_session_id },
    });
    await this.performanceEventsService.publish({
      utilisateur_id: saved.utilisateur_id,
      type: 'inscription_formation',
      reference_id: saved.id,
      payload: { training_session_id: saved.training_session_id },
    });
    return saved;
  }

  async update(
    id: string,
    updateDto: UpdateEnrollmentDto,
  ) {
    const enrollment =
      await this.findOne(id);

    Object.assign(enrollment, {
      ...updateDto,
      ...(updateDto.date_inscription && {
        date_inscription:
          new Date(updateDto.date_inscription),
      }),
    });

    return this.enrollmentRepository.save(
      enrollment,
    );
  }

  async remove(id: string) {
    const enrollment =
      await this.findOne(id);

    await this.enrollmentRepository.remove(
      enrollment,
    );

    return {
      message: 'Enrollment deleted successfully',
    };
  }
}
