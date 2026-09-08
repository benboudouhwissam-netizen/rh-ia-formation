import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizQuestionsService } from './quiz-questions.service';
import { QuizQuestion } from '../entities/quiz-question.entity';

describe('QuizQuestionsService', () => {
  let service: QuizQuestionsService;

  const repository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
        providers: [
          QuizQuestionsService,
          {
            provide: getRepositoryToken(QuizQuestion),
            useValue: repository,
          },
        ],
      }).compile();

    service = module.get<QuizQuestionsService>(
      QuizQuestionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // findAll
  // ============================================================

  describe('findAll', () => {
    it('should return all quiz questions', async () => {
      repository.findAndCount.mockResolvedValue([
        questions,
        2,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: questions,
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
          ordre: 'ASC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should apply pagination', async () => {
      repository.findAndCount.mockResolvedValue([
        questions,
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
          ordre: 'ASC',
        },
        take: 5,
        skip: 10,
      });
    });

    it('should filter by quiz_id', async () => {
      repository.findAndCount.mockResolvedValue([
        [questions[0]],
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
          ordre: 'ASC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should filter by type', async () => {
      repository.findAndCount.mockResolvedValue([
        [questions[0]],
        1,
      ]);

      await service.findAll({
        type: 'multiple_choice',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          type: 'multiple_choice',
        },
        relations: {
          quiz: true,
        },
        order: {
          ordre: 'ASC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should apply multiple filters', async () => {
      repository.findAndCount.mockResolvedValue([
        [questions[0]],
        1,
      ]);

      await service.findAll({
        quiz_id: 'quiz-123',
        type: 'multiple_choice',
        limit: 3,
        offset: 6,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          quiz_id: 'quiz-123',
          type: 'multiple_choice',
        },
        relations: {
          quiz: true,
        },
        order: {
          ordre: 'ASC',
        },
        take: 3,
        skip: 6,
      });
    });
  });

  // ============================================================
  // findOne
  // ============================================================

  describe('findOne', () => {
    it('should return one quiz question', async () => {
      repository.findOne.mockResolvedValue(
        questions[0],
      );

      const result = await service.findOne('1');

      expect(result).toEqual(questions[0]);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        relations: {
          quiz: true,
        },
      });
    });

    it('should throw an error when quiz question does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Quiz question with ID 999 not found',
      );
    });
  });

  // ============================================================
  // create
  // ============================================================

  describe('create', () => {
    it('should create a quiz question', async () => {
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

      repository.create.mockReturnValue(
        createdQuestion,
      );

      repository.save.mockResolvedValue(
        createdQuestion,
      );

      const result = await service.create(
        createDto,
      );

      expect(result).toEqual(
        createdQuestion,
      );

      expect(repository.create).toHaveBeenCalledWith(
        createDto,
      );

      expect(repository.save).toHaveBeenCalledWith(
        createdQuestion,
      );
    });

    it('should propagate repository errors', async () => {
      const createDto = {
        quiz_id: 'quiz-1',
        question: 'Nouvelle question ?',
        type: 'multiple_choice',
        ordre: 3,
      };

      const error = new Error(
        'Database error',
      );

      repository.create.mockReturnValue(
        createDto,
      );

      repository.save.mockRejectedValue(
        error,
      );

      await expect(
        service.create(createDto),
      ).rejects.toThrow(
        'Database error',
      );
    });
  });

  // ============================================================
  // update
  // ============================================================

  describe('update', () => {
    it('should update a quiz question', async () => {
      const question = {
        ...questions[0],
      };

      const updateDto = {
        question: 'Question modifiée ?',
        type: 'true_false',
        ordre: 5,
      };

      const updatedQuestion = {
        ...question,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(
        question,
      );

      repository.save.mockResolvedValue(
        updatedQuestion,
      );

      const result = await service.update(
        '1',
        updateDto,
      );

      expect(result).toEqual(
        updatedQuestion,
      );

      expect(repository.save).toHaveBeenCalledWith(
        updatedQuestion,
      );
    });

    it('should throw an error when quiz question does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          question: 'Question modifiée ?',
        }),
      ).rejects.toThrow(
        'Quiz question with ID 999 not found',
      );
    });
  });

  // ============================================================
  // remove
  // ============================================================

  describe('remove', () => {
    it('should remove a quiz question', async () => {
      const question = {
        ...questions[0],
      };

      repository.findOne.mockResolvedValue(
        question,
      );

      repository.remove.mockResolvedValue(
        question,
      );

      const result = await service.remove('1');

      expect(result).toEqual({
        message:
          'Quiz question deleted successfully',
      });

      expect(
        repository.remove,
      ).toHaveBeenCalledWith(
        question,
      );
    });

    it('should throw an error when quiz question does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Quiz question with ID 999 not found',
      );
    });
  });
});