import { Test, TestingModule } from '@nestjs/testing';

import { QuizAnswersController } from './quiz-answers.controller';
import { QuizAnswersService } from './quiz-answers.service';

describe('QuizAnswersController', () => {
  let controller: QuizAnswersController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const answers = [
    {
      id: '1',
      question_id: 'question-1',
      answer: 'JavaScript',
      est_correcte: true,
      ordre: 1,
    },
    {
      id: '2',
      question_id: 'question-1',
      answer: 'Python',
      est_correcte: false,
      ordre: 2,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAnswersController],
      providers: [
        {
          provide: QuizAnswersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<QuizAnswersController>(QuizAnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('GET /api/quiz-answers - should return all quiz answers', async () => {
      service.findAll.mockResolvedValue({
        data: answers,
        total: 2,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: answers,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('GET /api/quiz-answers?limit=3&offset=6 - should apply pagination', async () => {
      const filter = {
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue({
        data: [answers[0]],
        total: 10,
        limit: 3,
        offset: 6,
      });

      const result = await controller.findAll(filter);

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(6);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('GET /api/quiz-answers?question_id=question-1 - should filter by question_id', async () => {
      const filter = {
        question_id: 'question-1',
      };

      service.findAll.mockResolvedValue({
        data: answers,
        total: 2,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('GET /api/quiz-answers?est_correcte=true - should filter by est_correcte', async () => {
      const filter = {
        est_correcte: true,
      };

      service.findAll.mockResolvedValue({
        data: [answers[0]],
        total: 1,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('GET /api/quiz-answers?est_correcte=false - should filter false answers', async () => {
      const filter = {
        est_correcte: false,
      };

      service.findAll.mockResolvedValue({
        data: [answers[1]],
        total: 1,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('GET /api/quiz-answers - should apply multiple filters', async () => {
      const filter = {
        question_id: 'question-1',
        est_correcte: true,
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue({
        data: [answers[0]],
        total: 1,
        limit: 3,
        offset: 6,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('GET /api/quiz-answers - should propagate service errors', async () => {
      const error = new Error('Service error');

      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('GET /api/quiz-answers/:id - should return one quiz answer', async () => {
      service.findOne.mockResolvedValue(answers[0]);

      const result = await controller.findOne('1');

      expect(result).toEqual(answers[0]);

      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('GET /api/quiz-answers/:id - should propagate service errors', async () => {
      const error = new Error('Answer not found');

      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne('999')).rejects.toThrow(
        'Answer not found',
      );
    });
  });

  describe('create', () => {
    it('POST /api/quiz-answers - should create a quiz answer', async () => {
      const createDto = {
        question_id: 'question-1',
        answer: 'Java',
        est_correcte: true,
        ordre: 3,
      };

      const createdAnswer = {
        id: '3',
        ...createDto,
      };

      service.create.mockResolvedValue(createdAnswer);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdAnswer);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('POST /api/quiz-answers - should propagate service errors', async () => {
      const error = new Error('Service error');

      service.create.mockRejectedValue(error);

      await expect(
        controller.create({
          question_id: 'question-1',
          answer: 'Java',
        } as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('update', () => {
    it('PUT /api/quiz-answers/:id - should update a quiz answer', async () => {
      const updateDto = {
        answer: 'Java avancé',
        est_correcte: true,
        ordre: 5,
      };

      const updatedAnswer = {
        ...answers[0],
        ...updateDto,
      };

      service.update.mockResolvedValue(updatedAnswer);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedAnswer);

      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('PUT /api/quiz-answers/:id - should propagate service errors', async () => {
      const error = new Error('Service error');

      service.update.mockRejectedValue(error);

      await expect(
        controller.update('999', {
          answer: 'Réponse modifiée',
        }),
      ).rejects.toThrow('Service error');
    });
  });

  describe('remove', () => {
    it('DELETE /api/quiz-answers/:id - should delete a quiz answer', async () => {
      const response = {
        message: 'Quiz answer deleted successfully',
      };

      service.remove.mockResolvedValue(response);

      const result = await controller.remove('1');

      expect(result).toEqual(response);

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('DELETE /api/quiz-answers/:id - should propagate service errors', async () => {
      const error = new Error('Service error');

      service.remove.mockRejectedValue(error);

      await expect(controller.remove('999')).rejects.toThrow('Service error');
    });
  });
});
