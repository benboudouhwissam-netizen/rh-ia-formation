import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrainingSessionsService } from './training-sessions.service';
import { TrainingSession } from '../entities/training-session.entity';
import { Enrollment } from '../entities/enrollment.entity';

describe('TrainingSessionsService', () => {
  let service: TrainingSessionsService;
  let repository: jest.Mocked<Repository<TrainingSession>>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          TrainingSessionsService,
          {
            provide: getRepositoryToken(TrainingSession),
            useValue: mockRepository,
          },
          {
            provide: getRepositoryToken(Enrollment),
            useValue: { count: jest.fn().mockResolvedValue(0) },
          },
        ],
      }).compile();

    service = module.get<TrainingSessionsService>(
      TrainingSessionsService,
    );

    repository =
      module.get<jest.Mocked<Repository<TrainingSession>>>(
        getRepositoryToken(TrainingSession),
      );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all training sessions', async () => {
      const sessions = [
        {
          id: '1',
          formation_id: 'formation-1',
          lieu: 'Rabat',
          statut: 'active',
        },
        {
          id: '2',
          formation_id: 'formation-2',
          lieu: 'Casablanca',
          statut: 'active',
        },
      ] as TrainingSession[];

      const getManyAndCount = jest
        .fn()
        .mockResolvedValue([sessions, 2]);

      const orderBy = jest.fn().mockReturnThis();
      const take = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip,
        take,
        orderBy,
        getManyAndCount,
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      const result = await service.findAll({});

      expect(result).toEqual({
        data: sessions,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith(
        'session',
      );

      expect(getManyAndCount).toHaveBeenCalledTimes(1);
    });

    it('should apply pagination', async () => {
      const sessions = [
        {
          id: '1',
          formation_id: 'formation-1',
        },
      ] as TrainingSession[];

      const getManyAndCount = jest
        .fn()
        .mockResolvedValue([sessions, 10]);

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount,
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      const result = await service.findAll({
        limit: 3,
        offset: 6,
      });

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);

      expect(queryBuilder.skip).toHaveBeenCalledWith(6);
      expect(queryBuilder.take).toHaveBeenCalledWith(3);
    });

    it('should filter by formation_id', async () => {
      const getManyAndCount = jest
        .fn()
        .mockResolvedValue([[], 0]);

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount,
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findAll({
        formation_id: 'formation-123',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'session.formation_id = :formation_id',
        {
          formation_id: 'formation-123',
        },
      );
    });

    it('should filter by statut', async () => {
      const getManyAndCount = jest
        .fn()
        .mockResolvedValue([[], 0]);

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount,
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findAll({
        statut: 'active',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'session.statut = :statut',
        {
          statut: 'active',
        },
      );
    });

    it('should apply multiple filters', async () => {
      const getManyAndCount = jest
        .fn()
        .mockResolvedValue([[], 0]);

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount,
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findAll({
        formation_id: 'formation-123',
        statut: 'active',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);

      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'session.formation_id = :formation_id',
        {
          formation_id: 'formation-123',
        },
      );

      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'session.statut = :statut',
        {
          statut: 'active',
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return one training session', async () => {
      const session = {
        id: '1',
        formation_id: 'formation-1',
        lieu: 'Rabat',
      } as TrainingSession;

      repository.findOne.mockResolvedValue(session);

      const result = await service.findOne('1');

      expect(result).toEqual(session);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          formation: true,
        },
      });
    });

    it('should throw an error when training session does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Training session with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a training session', async () => {
      // ✅ Corrigé : dates en string ISO (cohérent avec @IsDateString() du DTO)
      const dto = {
        formation_id: 'formation-1',
        date_debut: '2026-08-20T00:00:00.000Z',
        date_fin: '2026-08-21T00:00:00.000Z',
        lieu: 'Rabat',
        capacite: 20,
        statut: 'active',
      };

      const createdSession = {
        id: '1',
        ...dto,
      } as unknown as TrainingSession;

      repository.create.mockReturnValue(createdSession);
      repository.save.mockResolvedValue(createdSession);

      const result = await service.create(dto);

      expect(result).toEqual(createdSession);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(
        createdSession,
      );
    });

    it('should propagate repository errors', async () => {
      // ✅ Corrigé : date en string ISO
      const dto = {
        formation_id: 'formation-1',
        date_debut: '2026-08-20T00:00:00.000Z',
      };

      const error = new Error(
        'Database error',
      );

      repository.create.mockReturnValue(
        dto as unknown as TrainingSession,
      );

      repository.save.mockRejectedValue(error);

      await expect(
        service.create(dto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a training session', async () => {
      const session = {
        id: '1',
        formation_id: 'formation-1',
        lieu: 'Rabat',
        capacite: 20,
      } as TrainingSession;

      repository.findOne.mockResolvedValue(session);

      const updatedSession = {
        ...session,
        lieu: 'Casablanca',
        capacite: 30,
      };

      repository.save.mockResolvedValue(
        updatedSession as TrainingSession,
      );

      const result = await service.update('1', {
        lieu: 'Casablanca',
        capacite: 30,
      });

      expect(result).toEqual(updatedSession);

      expect(repository.save).toHaveBeenCalledWith(
        updatedSession,
      );
    });

    it('should throw an error when training session does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          lieu: 'Casablanca',
        }),
      ).rejects.toThrow(
        'Training session with ID 999 not found',
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a training session', async () => {
      const session = {
        id: '1',
        formation_id: 'formation-1',
      } as TrainingSession;

      repository.findOne.mockResolvedValue(session);
      repository.remove.mockResolvedValue(
        session,
      );

      const result = await service.remove('1');

      expect(result).toEqual({
        message: 'Training session deleted successfully',
      });

      expect(repository.remove).toHaveBeenCalledWith(
        session,
      );
    });

    it('should throw an error when training session does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Training session with ID 999 not found',
      );

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
