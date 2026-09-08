import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizResultsService } from './quiz-results.service';
import { QuizResult } from '../entities/quiz-result.entity';

describe('QuizResultsService', () => {
  let service: QuizResultsService;

  const repository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const results = [
    {
      id: '1',
      quiz_id: 'quiz-1',
      utilisateur_id: 'user-1',
      score: 8,
      score_max: 10,
      reussi: true,
      date_passage: new Date('2026-08-01'),
    },
    {
      id: '2',
      quiz_id: 'quiz-2',
      utilisateur_id: 'user-2',
      score: 5,
      score_max: 10,
      reussi: false,
      date_passage: new Date('2026-08-02'),
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          QuizResultsService,
          {
            provide: getRepositoryToken(QuizResult),
            useValue: repository,
          },
        ],
      }).compile();

    service = module.get<QuizResultsService>(
      QuizResultsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all quiz results', async () => {
      repository.findAndCount.mockResolvedValue([
        results,
        2,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: results,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should apply pagination', async () => {
      repository.findAndCount.mockResolvedValue([
        results,
        20,
      ]);

      const result = await service.findAll({
        limit: 5,
        offset: 10,
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 5,
        skip: 10,
      });
    });

    it('should filter by quiz_id', async () => {
      repository.findAndCount.mockResolvedValue([
        [results[0]],
        1,
      ]);

      await service.findAll({
        quiz_id: 'quiz-123',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          quiz_id: 'quiz-123',
        },
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should filter by utilisateur_id', async () => {
      repository.findAndCount.mockResolvedValue([
        [results[0]],
        1,
      ]);

      await service.findAll({
        utilisateur_id: 'user-123',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          utilisateur_id: 'user-123',
        },
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should filter by reussi', async () => {
      repository.findAndCount.mockResolvedValue([
        [results[0]],
        1,
      ]);

      await service.findAll({
        reussi: true,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          reussi: true,
        },
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should apply multiple filters', async () => {
      repository.findAndCount.mockResolvedValue([
        [results[0]],
        1,
      ]);

      await service.findAll({
        quiz_id: 'quiz-123',
        utilisateur_id: 'user-123',
        reussi: true,
        limit: 3,
        offset: 6,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          quiz_id: 'quiz-123',
          utilisateur_id: 'user-123',
          reussi: true,
        },
        relations: {
          quiz: true,
        },
        order: {
          date_passage: 'DESC',
        },
        take: 3,
        skip: 6,
      });
    });
  });

  describe('findOne', () => {
    it('should return one quiz result', async () => {
      repository.findOne.mockResolvedValue(results[0]);

      const result = await service.findOne('1');

      expect(result).toEqual(results[0]);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        relations: {
          quiz: true,
        },
      });
    });

    it('should throw an error when quiz result does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Quiz result with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a quiz result', async () => {
      const createDto = {
        quiz_id: 'quiz-1',
        utilisateur_id: 'user-1',
        score: 9,
        score_max: 10,
        reussi: true,
        date_passage: '2026-08-03T10:00:00.000Z',
      };

      const createdResult = {
        id: '3',
        ...createDto,
      };

      repository.create.mockReturnValue(createdResult);
      repository.save.mockResolvedValue(createdResult);

      const result = await service.create(createDto);

      expect(result).toEqual(createdResult);

      expect(repository.create).toHaveBeenCalledWith(
        createDto,
      );

      expect(repository.save).toHaveBeenCalledWith(
        createdResult,
      );
    });

    it('should propagate repository errors', async () => {
      const createDto = {
        quiz_id: 'quiz-1',
        utilisateur_id: 'user-1',
        score: 9,
        score_max: 10,
        reussi: true,
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
    it('should update a quiz result', async () => {
      const result = {
        ...results[0],
      };

      const updateDto = {
        score: 10,
        reussi: true,
      };

      const updatedResult = {
        ...result,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(result);
      repository.save.mockResolvedValue(updatedResult);

      const response = await service.update(
        '1',
        updateDto,
      );

      expect(response).toEqual(updatedResult);

      expect(repository.save).toHaveBeenCalledWith(
        updatedResult,
      );
    });

    it('should throw an error when quiz result does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          score: 10,
        }),
      ).rejects.toThrow(
        'Quiz result with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a quiz result', async () => {
      const result = {
        ...results[0],
      };

      repository.findOne.mockResolvedValue(result);
      repository.remove.mockResolvedValue(result);

      const response = await service.remove('1');

      expect(response).toEqual({
        message: 'Quiz result deleted successfully',
      });

      expect(repository.remove).toHaveBeenCalledWith(
        result,
      );
    });

    it('should throw an error when quiz result does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Quiz result with ID 999 not found',
      );
    });
  });
});