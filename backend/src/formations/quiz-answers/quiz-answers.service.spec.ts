import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { QuizAnswersService } from './quiz-answers.service';

describe('QuizAnswersService', () => {
  let service: QuizAnswersService;

  const repository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          QuizAnswersService,
          {
            provide: getRepositoryToken(QuizAnswer),
            useValue: repository,
          },
        ],
      }).compile();

    service = module.get<QuizAnswersService>(
      QuizAnswersService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all quiz answers', async () => {
      repository.findAndCount.mockResolvedValue([
        answers,
        2,
      ]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: answers,
        total: 2,
        limit: 10,
        offset: 0,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: {
          question: true,
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
        answers,
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
          question: true,
        },
        order: {
          ordre: 'ASC',
        },
        take: 5,
        skip: 10,
      });
    });

    it('should filter by question_id', async () => {
      repository.findAndCount.mockResolvedValue([
        [answers[0]],
        1,
      ]);

      await service.findAll({
        question_id: 'question-123',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          question_id: 'question-123',
        },
        relations: {
          question: true,
        },
        order: {
          ordre: 'ASC',
        },
        take: 10,
        skip: 0,
      });
    });

    it('should filter by est_correcte', async () => {
      repository.findAndCount.mockResolvedValue([
        [answers[0]],
        1,
      ]);

      await service.findAll({
        est_correcte: true,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          est_correcte: true,
        },
        relations: {
          question: true,
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
        [answers[0]],
        1,
      ]);

      await service.findAll({
        question_id: 'question-123',
        est_correcte: true,
        limit: 3,
        offset: 6,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          question_id: 'question-123',
          est_correcte: true,
        },
        relations: {
          question: true,
        },
        order: {
          ordre: 'ASC',
        },
        take: 3,
        skip: 6,
      });
    });
  });

  describe('findOne', () => {
    it('should return one quiz answer', async () => {
      repository.findOne.mockResolvedValue(answers[0]);

      const result = await service.findOne('1');

      expect(result).toEqual(answers[0]);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          question: true,
        },
      });
    });

    it('should throw an error when quiz answer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('999'),
      ).rejects.toThrow(
        'Quiz answer with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    it('should create a quiz answer', async () => {
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

      repository.create.mockReturnValue(createdAnswer);
      repository.save.mockResolvedValue(createdAnswer);

      const result = await service.create(createDto);

      expect(result).toEqual(createdAnswer);

      expect(repository.create).toHaveBeenCalledWith(
        createDto,
      );

      expect(repository.save).toHaveBeenCalledWith(
        createdAnswer,
      );
    });

    it('should propagate repository errors', async () => {
      const createDto = {
        question_id: 'question-1',
        answer: 'Java',
        est_correcte: true,
        ordre: 3,
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
    it('should update a quiz answer', async () => {
      const answer = {
        ...answers[0],
      };

      const updateDto = {
        answer: 'Java avancé',
        est_correcte: false,
        ordre: 5,
      };

      const updatedAnswer = {
        ...answer,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(answer);
      repository.save.mockResolvedValue(updatedAnswer);

      const result = await service.update(
        '1',
        updateDto,
      );

      expect(result).toEqual(updatedAnswer);

      expect(repository.save).toHaveBeenCalledWith(
        updatedAnswer,
      );
    });

    it('should throw an error when quiz answer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', {
          answer: 'Réponse modifiée',
        }),
      ).rejects.toThrow(
        'Quiz answer with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a quiz answer', async () => {
      const answer = {
        ...answers[0],
      };

      repository.findOne.mockResolvedValue(answer);
      repository.remove.mockResolvedValue(answer);

      const result = await service.remove('1');

      expect(result).toEqual({
        message: 'Quiz answer deleted successfully',
      });

      expect(repository.remove).toHaveBeenCalledWith(
        answer,
      );
    });

    it('should throw an error when quiz answer does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('999'),
      ).rejects.toThrow(
        'Quiz answer with ID 999 not found',
      );
    });
  });
});