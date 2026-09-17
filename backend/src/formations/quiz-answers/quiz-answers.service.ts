import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizAnswer } from '../entities/quiz-answer.entity';
import { CreateQuizAnswerDto } from '../dto/create-quiz-answer.dto';
import { UpdateQuizAnswerDto } from '../dto/update-quiz-answer.dto';
import { FilterQuizAnswerDto } from '../dto/filter-quiz-answer.dto';

@Injectable()
export class QuizAnswersService {
  constructor(
    @InjectRepository(QuizAnswer)
    private readonly quizAnswerRepository: Repository<QuizAnswer>,
  ) {}

  async findAll(filterDto: FilterQuizAnswerDto) {
    const { question_id, est_correcte, limit = 10, offset = 0 } = filterDto;

    const where: any = {};

    if (question_id) {
      where.question_id = question_id;
    }

    if (est_correcte !== undefined) {
      where.est_correcte = est_correcte;
    }

    const [data, total] = await this.quizAnswerRepository.findAndCount({
      where,
      relations: {
        question: true,
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
    const quizAnswer = await this.quizAnswerRepository.findOne({
      where: { id },
      relations: {
        question: true,
      },
    });

    if (!quizAnswer) {
      throw new NotFoundException(`Quiz answer with ID ${id} not found`);
    }

    return quizAnswer;
  }

  async create(createDto: CreateQuizAnswerDto) {
    const quizAnswer = this.quizAnswerRepository.create(createDto);

    return this.quizAnswerRepository.save(quizAnswer);
  }

  async update(id: string, updateDto: UpdateQuizAnswerDto) {
    const quizAnswer = await this.findOne(id);

    Object.assign(quizAnswer, updateDto);

    return this.quizAnswerRepository.save(quizAnswer);
  }

  async remove(id: string) {
    const quizAnswer = await this.findOne(id);

    await this.quizAnswerRepository.remove(quizAnswer);

    return {
      message: 'Quiz answer deleted successfully',
    };
  }
}
