import { Test, TestingModule } from '@nestjs/testing';

import { QuizResultsController } from './quiz-results.controller';
import { QuizResultsService } from './quiz-results.service';

describe('QuizResultsController', () => {
  let controller: QuizResultsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
    },
    {
      id: '2',
      quiz_id: 'quiz-2',
      utilisateur_id: 'user-2',
      score: 5,
      score_max: 10,
      reussi: false,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizResultsController],
      providers: [
        {
          provide: QuizResultsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<QuizResultsController>(QuizResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('GET /api/quiz-results - should return all quiz results', async () => {
      const expected = {
        data: results,
        total: 2,
        limit: 10,
        offset: 0,
      };

      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({});

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('GET /api/quiz-results?limit=3&offset=6 - should apply pagination', async () => {
      const filters = {
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue({
        data: [results[0]],
        total: 10,
        limit: 3,
        offset: 6,
      });

      const result = await controller.findAll(filters);

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('GET /api/quiz-results?quiz_id=quiz-1 - should filter by quiz_id', async () => {
      const filters = {
        quiz_id: 'quiz-1',
      };

      service.findAll.mockResolvedValue({
        data: [results[0]],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll(filters);

      expect(result.data).toEqual([results[0]]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('GET /api/quiz-results?utilisateur_id=user-1 - should filter by utilisateur_id', async () => {
      const filters = {
        utilisateur_id: 'user-1',
      };

      service.findAll.mockResolvedValue({
        data: [results[0]],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll(filters);

      expect(result.data).toEqual([results[0]]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('GET /api/quiz-results?reussi=true - should filter by reussi', async () => {
      const filters = {
        reussi: true,
      };

      service.findAll.mockResolvedValue({
        data: [results[0]],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll(filters);

      expect(result.data).toEqual([results[0]]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('GET /api/quiz-results - should apply multiple filters', async () => {
      const filters = {
        quiz_id: 'quiz-1',
        utilisateur_id: 'user-1',
        reussi: true,
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue({
        data: [results[0]],
        total: 1,
        limit: 3,
        offset: 6,
      });

      const result = await controller.findAll(filters);

      expect(result.data).toEqual([results[0]]);
      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('GET /api/quiz-results - should propagate service errors', async () => {
      const error = new Error('Service error');

      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('GET /api/quiz-results/:id - should return one quiz result', async () => {
      service.findOne.mockResolvedValue(results[0]);

      const result = await controller.findOne('1');

      expect(result).toEqual(results[0]);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('GET /api/quiz-results/:id - should propagate service errors', async () => {
      service.findOne.mockRejectedValue(new Error('Quiz result not found'));

      await expect(controller.findOne('999')).rejects.toThrow(
        'Quiz result not found',
      );
    });
  });

  describe('create', () => {
    it('POST /api/quiz-results - should create a quiz result', async () => {
      const createDto = {
        quiz_id: 'quiz-1',
        utilisateur_id: 'user-1',
        score: 9,
        score_max: 10,
        reussi: true,
      };

      const createdResult = {
        id: '3',
        ...createDto,
      };

      service.create.mockResolvedValue(createdResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('POST /api/quiz-results - should propagate service errors', async () => {
      service.create.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.create({
          quiz_id: 'quiz-1',
          utilisateur_id: 'user-1',
        }),
      ).rejects.toThrow('Service error');
    });
  });

  describe('update', () => {
    it('PUT /api/quiz-results/:id - should update a quiz result', async () => {
      const updateDto = {
        score: 10,
        reussi: true,
      };

      const updatedResult = {
        ...results[0],
        ...updateDto,
      };

      service.update.mockResolvedValue(updatedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedResult);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('PUT /api/quiz-results/:id - should propagate service errors', async () => {
      service.update.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.update('999', {
          score: 10,
        }),
      ).rejects.toThrow('Service error');
    });
  });

  describe('remove', () => {
    it('DELETE /api/quiz-results/:id - should delete a quiz result', async () => {
      const expected = {
        message: 'Quiz result deleted successfully',
      };

      service.remove.mockResolvedValue(expected);

      const result = await controller.remove('1');

      expect(result).toEqual(expected);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('DELETE /api/quiz-results/:id - should propagate service errors', async () => {
      service.remove.mockRejectedValue(new Error('Service error'));

      await expect(controller.remove('999')).rejects.toThrow('Service error');
    });
  });
});
