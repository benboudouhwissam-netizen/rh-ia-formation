import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from '../entities/enrollment.entity';
import { LearningTasksService } from '../learning-tasks/learning-tasks.service';
import { PerformanceEventsService } from '../performance-events/performance-events.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let repository: jest.Mocked<Repository<Enrollment>>;

  const enrollment = {
    id: '1',
    utilisateur_id: 'employee-1',
    training_session_id: 'session-1',
    date_inscription: new Date('2026-08-01'),
    statut: 'inscrit',
  } as Enrollment;

  const repositoryMock = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const learningTasksMock = { create: jest.fn() };
  const performanceEventsMock = { publish: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: repositoryMock,
        },
        { provide: LearningTasksService, useValue: learningTasksMock },
        { provide: PerformanceEventsService, useValue: performanceEventsMock },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(
      EnrollmentsService,
    );

    repository = module.get(
      getRepositoryToken(Enrollment),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    let queryBuilder: any;

    beforeEach(() => {
      queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );
    });

    it('should return all enrollments', async () => {
      const enrollments = [enrollment];

      queryBuilder.getManyAndCount.mockResolvedValue([
        enrollments,
        1,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: enrollments,
        total: 1,
        limit: 10,
        offset: 0,
      });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith(
        'enrollment',
      );
    });

    it('should apply pagination', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [enrollment],
        20,
      ]);

      const result = await service.findAll({
        limit: 5,
        offset: 10,
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should filter by utilisateur_id', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [enrollment],
        1,
      ]);

      await service.findAll({
        utilisateur_id: 'employee-123',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'enrollment.utilisateur_id = :utilisateur_id',
        {
          utilisateur_id: 'employee-123',
        },
      );
    });

    it('should filter by training_session_id', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [enrollment],
        1,
      ]);

      await service.findAll({
        training_session_id: 'session-123',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'enrollment.training_session_id = :training_session_id',
        {
          training_session_id: 'session-123',
        },
      );
    });

    it('should filter by statut', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [enrollment],
        1,
      ]);

      await service.findAll({
        statut: 'inscrit',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'enrollment.statut = :statut',
        {
          statut: 'inscrit',
        },
      );
    });

    it('should apply multiple filters', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [enrollment],
        1,
      ]);

      await service.findAll({
        utilisateur_id: 'employee-123',
        training_session_id: 'session-123',
        statut: 'inscrit',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return one enrollment', async () => {
      repository.findOne.mockResolvedValue(enrollment);

      const result = await service.findOne('1');

      expect(result).toEqual(enrollment);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          training_session: true,
        },
      });
    });

    it('should throw an error when enrollment does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Enrollment with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create an enrollment', async () => {
      repository.findOne.mockResolvedValue(null);

      repository.create.mockReturnValue(
        enrollment,
      );

      repository.save.mockResolvedValue(
        enrollment,
      );

      const result = await service.create({
        utilisateur_id: 'employee-1',
        training_session_id: 'session-1',
        date_inscription: '2026-08-01T10:00:00.000Z',
        statut: 'inscrit',
      });

      expect(result).toEqual(enrollment);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(
        enrollment,
      );
      expect(learningTasksMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          utilisateur_id: 'employee-1',
          type: 'suivre_formation',
          reference_id: '1',
        }),
      );
      expect(performanceEventsMock.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'inscription_formation', reference_id: '1' }),
      );
    });

    it('should reject duplicate enrollment', async () => {
      repository.findOne.mockResolvedValue(
        enrollment,
      );

      await expect(
        service.create({
          utilisateur_id: 'employee-1',
          training_session_id: 'session-1',
          date_inscription: '2026-08-01T10:00:00.000Z',
        }),
      ).rejects.toThrow(
        'Employee is already enrolled in this training session',
      );
    });

    it('should propagate repository errors', async () => {
      repository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.create({
          utilisateur_id: 'employee-1',
          training_session_id: 'session-1',
          date_inscription: '2026-08-01T10:00:00.000Z',
        }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const existing = {
        ...enrollment,
      } as Enrollment;

      repository.findOne.mockResolvedValue(
        existing,
      );


      repository.save.mockImplementation(
        async (entity) => entity as Enrollment,
      );

      const result = await service.update('1', {
        statut: 'termine',
      });

      expect(result).toEqual({
        ...enrollment,
        statut: 'termine',
      });

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw an error when enrollment does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          statut: 'termine',
        }),
      ).rejects.toThrow(
        'Enrollment with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove an enrollment', async () => {
      repository.findOne.mockResolvedValue(
        enrollment,
      );

      repository.remove.mockResolvedValue(
        enrollment,
      );

      const result = await service.remove('1');

      expect(result).toEqual({
        message: 'Enrollment deleted successfully',
      });

      expect(repository.remove).toHaveBeenCalledWith(
        enrollment,
      );
    });

    it('should throw an error when enrollment does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Enrollment with ID 999 not found',
      );
    });
  });
});
