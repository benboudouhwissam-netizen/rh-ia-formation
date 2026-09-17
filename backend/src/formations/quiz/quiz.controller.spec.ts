import { Test, TestingModule } from '@nestjs/testing';

import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

describe('QuizController', () => {
  let controller: QuizController;

  const quizService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: quizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('GET /api/quizzes - should return all quizzes', async () => {
      const quizzes = [
        {
          id: '1',
          formation_id: 'formation-1',
          titre: 'Quiz Backend',
          statut: 'active',
        },
        {
          id: '2',
          formation_id: 'formation-2',
          titre: 'Quiz Frontend',
          statut: 'active',
        },
      ];

      quizService.findAll.mockResolvedValue({
        data: quizzes,
        total: 2,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: quizzes,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(quizService.findAll).toHaveBeenCalledWith({});
    });

    it('GET /api/quizzes?limit=3&offset=0 - should apply pagination', async () => {
      quizService.findAll.mockResolvedValue({
        data: [],
        total: 10,
        limit: 3,
        offset: 0,
      });

      const filterDto = {
        limit: 3,
        offset: 0,
      };

      const result = await controller.findAll(filterDto);

      expect(result.limit).toBe(3);
      expect(result.offset).toBe(0);
      expect(quizService.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('GET /api/quizzes?formation_id=formation-1 - should filter by formation_id', async () => {
      quizService.findAll.mockResolvedValue({
        data: [],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const filterDto = {
        formation_id: 'formation-1',
      };

      await controller.findAll(filterDto);

      expect(quizService.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('GET /api/quizzes?statut=active - should filter by statut', async () => {
      quizService.findAll.mockResolvedValue({
        data: [],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const filterDto = {
        statut: 'active',
      };

      await controller.findAll(filterDto);

      expect(quizService.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('GET /api/quizzes - should apply multiple filters', async () => {
      quizService.findAll.mockResolvedValue({
        data: [],
        total: 1,
        limit: 5,
        offset: 0,
      });

      const filterDto = {
        formation_id: 'formation-1',
        statut: 'active',
        limit: 5,
        offset: 0,
      };

      await controller.findAll(filterDto);

      expect(quizService.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('GET /api/quizzes - should propagate service errors', async () => {
      quizService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('GET /api/quizzes/:id - should return one quiz', async () => {
      const quiz = {
        id: '1',
        formation_id: 'formation-1',
        titre: 'Quiz Backend',
        statut: 'active',
      };

      quizService.findOne.mockResolvedValue(quiz);

      const result = await controller.findOne('1');

      expect(result).toEqual(quiz);
      expect(quizService.findOne).toHaveBeenCalledWith('1');
    });

    it('GET /api/quizzes/:id - should propagate service errors', async () => {
      quizService.findOne.mockRejectedValue(new Error('Quiz not found'));

      await expect(controller.findOne('999')).rejects.toThrow('Quiz not found');
    });
  });

  describe('create', () => {
    it('POST /api/quizzes - should create a quiz', async () => {
      const createQuizDto = {
        formation_id: 'formation-1',
        titre: 'Quiz Backend',
        description: 'Quiz de test',
        duree: 30,
        score_requis: 70,
        statut: 'active',
      };

      const createdQuiz = {
        id: '1',
        ...createQuizDto,
      };

      quizService.create.mockResolvedValue(createdQuiz);

      const result = await controller.create(createQuizDto);

      expect(result).toEqual(createdQuiz);
      expect(quizService.create).toHaveBeenCalledWith(createQuizDto);
    });

    it('POST /api/quizzes - should propagate service errors', async () => {
      quizService.create.mockRejectedValue(new Error('Creation error'));

      const createQuizDto = {
        formation_id: 'formation-1',
        titre: 'Quiz Backend',
      };

      await expect(controller.create(createQuizDto)).rejects.toThrow(
        'Creation error',
      );
    });
  });

  describe('update', () => {
    it('PUT /api/quizzes/:id - should update a quiz', async () => {
      const updateQuizDto = {
        titre: 'Quiz Backend Updated',
        duree: 45,
      };

      const updatedQuiz = {
        id: '1',
        formation_id: 'formation-1',
        titre: 'Quiz Backend Updated',
        duree: 45,
        statut: 'active',
      };

      quizService.update.mockResolvedValue(updatedQuiz);

      const result = await controller.update('1', updateQuizDto);

      expect(result).toEqual(updatedQuiz);
      expect(quizService.update).toHaveBeenCalledWith('1', updateQuizDto);
    });

    it('PUT /api/quizzes/:id - should propagate service errors', async () => {
      quizService.update.mockRejectedValue(new Error('Update error'));

      const updateQuizDto = {
        titre: 'Quiz Updated',
      };

      await expect(controller.update('999', updateQuizDto)).rejects.toThrow(
        'Update error',
      );
    });
  });

  describe('remove', () => {
    it('DELETE /api/quizzes/:id - should delete a quiz', async () => {
      const response = {
        message: 'Quiz deleted successfully',
      };

      quizService.remove.mockResolvedValue(response);

      const result = await controller.remove('1');

      expect(result).toEqual(response);
      expect(quizService.remove).toHaveBeenCalledWith('1');
    });

    it('DELETE /api/quizzes/:id - should propagate service errors', async () => {
      quizService.remove.mockRejectedValue(new Error('Delete error'));

      await expect(controller.remove('999')).rejects.toThrow('Delete error');
    });
  });
});
