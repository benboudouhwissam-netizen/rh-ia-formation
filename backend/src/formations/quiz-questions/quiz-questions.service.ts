import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizQuestion } from '../entities/quiz-question.entity';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { FilterQuizQuestionDto } from '../dto/filter-quiz-question.dto';

@Injectable()
export class QuizQuestionsService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async findAll(filterDto: FilterQuizQuestionDto) {
    const { quiz_id, type, limit = 10, offset = 0 } = filterDto;

    const where: any = {};

    if (quiz_id) {
      where.quiz_id = quiz_id;
    }

    if (type) {
      where.type = type;
    }

    const [data, total] = await this.quizQuestionRepository.findAndCount({
      where,
      relations: {
        quiz: true,
      },
      order: {
        ordre: 'ASC',
      },
      take: limit,
      skip: offset,
    });

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const question = await this.quizQuestionRepository.findOne({
      where: { id },
      relations: {
        quiz: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Quiz question with ID ${id} not found`);
    }

    return question;
  }

  async create(createDto: CreateQuizQuestionDto) {
    try {
      const question = this.quizQuestionRepository.create(createDto);

      return await this.quizQuestionRepository.save(question);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateQuizQuestionDto) {
    const question = await this.findOne(id);

    Object.assign(question, updateDto);

    return this.quizQuestionRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.findOne(id);

    await this.quizQuestionRepository.remove(question);

    return {
      message: 'Quiz question deleted successfully',
    };
  }
}
