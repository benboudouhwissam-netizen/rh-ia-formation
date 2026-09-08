import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { QuizService } from './quiz.service';
import { Quiz } from '../entities/quiz.entity';

describe('QuizService', () => {
  let service: QuizService;

  const quiz1 = {
    id: '1',
    formation_id: 'formation-1',
    titre: 'Quiz Java',
    description: 'Évaluation Java',
    duree: 30,
    score_requis: 70,
    statut: 'active',
  };

  const quiz2 = {
    id: '2',
    formation_id: 'formation-2',
    titre: 'Quiz Python',
    description: 'Évaluation Python',
    duree: 45,
    score_requis: 60,
    statut: 'inactive',
  };

  const repository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          QuizService,
          {
            provide: getRepositoryToken(Quiz),
            useValue: repository,
          },
        ],
      }).compile();

    service = module.get<QuizService>(QuizService);

    jest.clearAllMocks();

    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    queryBuilder.leftJoinAndSelect.mockReturnThis();
    queryBuilder.take.mockReturnThis();
    queryBuilder.skip.mockReturnThis();
    queryBuilder.andWhere.mockReturnThis();
  });

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      const quizzes = [quiz1, quiz2];

      queryBuilder.getManyAndCount.mockResolvedValue([
        quizzes,
        2,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: quizzes,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(queryBuilder.getManyAndCount)
        .toHaveBeenCalled();
    });

    it('should apply pagination', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [quiz1],
        1,
      ]);

      const result = await service.findAll({
        limit: 3,
        offset: 6,
      });

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);

      expect(queryBuilder.take)
        .toHaveBeenCalledWith(3);

      expect(queryBuilder.skip)
        .toHaveBeenCalledWith(6);
    });

    it('should filter by formation_id', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [quiz1],
        1,
      ]);

      await service.findAll({
        formation_id: 'formation-123',
      });

      expect(queryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'quiz.formation_id = :formation_id',
          {
            formation_id: 'formation-123',
          },
        );
    });

    it('should filter by statut', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [quiz1],
        1,
      ]);

      await service.findAll({
        statut: 'active',
      });

      expect(queryBuilder.andWhere)
        .toHaveBeenCalledWith(
          'quiz.statut = :statut',
          {
            statut: 'active',
          },
        );
    });

    it('should apply multiple filters', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [quiz1],
        1,
      ]);

      await service.findAll({
        formation_id: 'formation-1',
        statut: 'active',
      });

      expect(queryBuilder.andWhere)
        .toHaveBeenCalledTimes(2);

      expect(queryBuilder.andWhere)
        .toHaveBeenNthCalledWith(
          1,
          'quiz.formation_id = :formation_id',
          {
            formation_id: 'formation-1',
          },
        );

      expect(queryBuilder.andWhere)
        .toHaveBeenNthCalledWith(
          2,
          'quiz.statut = :statut',
          {
            statut: 'active',
          },
        );
    });
  });

  describe('findOne', () => {
    it('should return one quiz', async () => {
      repository.findOne.mockResolvedValue(quiz1);

      const result = await service.findOne('1');

      expect(result).toEqual(quiz1);

      expect(repository.findOne)
        .toHaveBeenCalledWith({
          where: { id: '1' },
          relations: {
            formation: true,
          },
        });
    });

    it('should throw an error when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Quiz with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a quiz', async () => {
      const createDto = {
        formation_id: 'formation-1',
        titre: 'Quiz Java',
        description: 'Évaluation Java',
        duree: 30,
        score_requis: 70,
        statut: 'active',
      };

      repository.create.mockReturnValue(quiz1);
      repository.save.mockResolvedValue(quiz1);

      const result = await service.create(createDto);

      expect(repository.create)
        .toHaveBeenCalledWith(createDto);

      expect(repository.save)
        .toHaveBeenCalledWith(quiz1);

      expect(result).toEqual(quiz1);
    });

    it('should propagate repository errors', async () => {
      const createDto = {
        formation_id: 'formation-1',
        titre: 'Quiz Java',
      };

      const error = new Error('Database error');

      repository.create.mockReturnValue(createDto);
      repository.save.mockRejectedValue(error);

      await expect(
        service.create(createDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a quiz', async () => {
      const quiz = {
        ...quiz1,
      };

      const updateDto = {
        titre: 'Quiz Java Avancé',
        duree: 40,
      };

      repository.findOne.mockResolvedValue(quiz);

      repository.save.mockImplementation(
        async (entity) => entity,
      );

      const result = await service.update(
        '1',
        updateDto,
      );

      expect(result).toEqual({
        ...quiz1,
        titre: 'Quiz Java Avancé',
        duree: 40,
      });

      expect(repository.save)
        .toHaveBeenCalledWith({
          ...quiz1,
          titre: 'Quiz Java Avancé',
          duree: 40,
        });
    });

    it('should throw an error when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          titre: 'Quiz inexistant',
        }),
      ).rejects.toThrow(
        'Quiz with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a quiz', async () => {
      repository.findOne.mockResolvedValue(quiz1);
      repository.remove.mockResolvedValue(quiz1);

      const result = await service.remove('1');

      expect(repository.remove)
        .toHaveBeenCalledWith(quiz1);

      expect(result).toEqual({
        message: 'Quiz deleted successfully',
      });
    });

    it('should throw an error when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Quiz with ID 999 not found',
      );
    });
  });
});