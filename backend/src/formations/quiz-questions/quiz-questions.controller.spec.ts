import { Test, TestingModule } from '@nestjs/testing';

import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsService } from './quiz-questions.service';

describe('QuizQuestionsController', () => {
  let controller: QuizQuestionsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const questions = [
    {
      id: '1',
      quiz_id: 'quiz-1',
      question: 'Qu’est-ce que TypeScript ?',
      type: 'multiple_choice',
      ordre: 1,
    },
    {
      id: '2',
      quiz_id: 'quiz-1',
      question: 'Qu’est-ce que NestJS ?',
      type: 'multiple_choice',
      ordre: 2,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [QuizQuestionsController],
        providers: [
          {
            provide: QuizQuestionsService,
            useValue: service,
          },
        ],
      }).compile();

    controller = module.get<QuizQuestionsController>(
      QuizQuestionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('GET /api/quiz-questions - should return all quiz questions', async () => {
      service.findAll.mockResolvedValue({
        data: questions,
        total: 2,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: questions,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('GET /api/quiz-questions?limit=3&offset=6 - should apply pagination', async () => {
      const filter = {
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue({
        data: questions,
        total: 20,
        limit: 3,
        offset: 6,
      });

      const result = await controller.findAll(filter);

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);

      expect(service.findAll).toHaveBeenCalledWith(
        filter,
      );
    });

    it('GET /api/quiz-questions?quiz_id=quiz-1 - should filter by quiz_id', async () => {
      const filter = {
        quiz_id: 'quiz-1',
      };

      service.findAll.mockResolvedValue({
        data: questions,
        total: 2,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(
        filter,
      );
    });

    it('GET /api/quiz-questions?type=multiple_choice - should filter by type', async () => {
      const filter = {
        type: 'multiple_choice',
      };

      service.findAll.mockResolvedValue({
        data: questions,
        total: 2,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(
        filter,
      );
    });

    it('GET /api/quiz-questions - should apply multiple filters', async () => {
      const filter = {
        quiz_id: 'quiz-1',
        type: 'multiple_choice',
        limit: 5,
        offset: 10,
      };

      service.findAll.mockResolvedValue({
        data: questions,
        total: 2,
        limit: 5,
        offset: 10,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(
        filter,
      );
    });

    it('GET /api/quiz-questions - should propagate service errors', async () => {
      service.findAll.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.findAll({}),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('GET /api/quiz-questions/:id - should return one quiz question', async () => {
      service.findOne.mockResolvedValue(questions[0]);

      const result = await controller.findOne('1');

      expect(result).toEqual(questions[0]);

      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('GET /api/quiz-questions/:id - should propagate service errors', async () => {
      service.findOne.mockRejectedValue(
        new Error('Quiz question not found'),
      );

      await expect(
        controller.findOne('999'),
      ).rejects.toThrow(
        'Quiz question not found',
      );
    });
  });

  describe('create', () => {
    it('POST /api/quiz-questions - should create a quiz question', async () => {
      const createDto = {
        quiz_id: 'quiz-1',
        question: 'Nouvelle question ?',
        type: 'multiple_choice',
        ordre: 3,
      };

      const createdQuestion = {
        id: '3',
        ...createDto,
      };

      service.create.mockResolvedValue(
        createdQuestion,
      );

      const result = await controller.create(
        createDto,
      );

      expect(result).toEqual(createdQuestion);

      expect(service.create).toHaveBeenCalledWith(
        createDto,
      );
    });

    it('POST /api/quiz-questions - should propagate service errors', async () => {
      service.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.create({
          quiz_id: 'quiz-1',
          question: 'Question',
          type: 'multiple_choice',
          ordre: 1,
        }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('PUT /api/quiz-questions/:id - should update a quiz question', async () => {
      const updateDto = {
        question: 'Question modifiée ?',
        type: 'true_false',
        ordre: 5,
      };

      const updatedQuestion = {
        ...questions[0],
        ...updateDto,
      };

      service.update.mockResolvedValue(
        updatedQuestion,
      );

      const result = await controller.update(
        '1',
        updateDto,
      );

      expect(result).toEqual(updatedQuestion);

      expect(service.update).toHaveBeenCalledWith(
        '1',
        updateDto,
      );
    });

    it('PUT /api/quiz-questions/:id - should propagate service errors', async () => {
      service.update.mockRejectedValue(
        new Error('Quiz question not found'),
      );

      await expect(
        controller.update('999', {
          question: 'Question modifiée ?',
        }),
      ).rejects.toThrow(
        'Quiz question not found',
      );
    });
  });

  describe('remove', () => {
    it('DELETE /api/quiz-questions/:id - should delete a quiz question', async () => {
      const response = {
        message: 'Quiz question deleted successfully',
      };

      service.remove.mockResolvedValue(response);

      const result = await controller.remove('1');

      expect(result).toEqual(response);

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('DELETE /api/quiz-questions/:id - should propagate service errors', async () => {
      service.remove.mockRejectedValue(
        new Error('Quiz question not found'),
      );

      await expect(
        controller.remove('999'),
      ).rejects.toThrow(
        'Quiz question not found',
      );
    });
  });
});