import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { FilterQuizDto } from '../dto/filter-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async findAll(filterDto: FilterQuizDto) {
    const {
      limit = 10,
      offset = 0,
      formation_id,
      statut,
    } = filterDto;

    const queryBuilder = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.formation', 'formation')
      .take(limit)
      .skip(offset);

    if (formation_id) {
      queryBuilder.andWhere(
        'quiz.formation_id = :formation_id',
        { formation_id },
      );
    }

    if (statut) {
      queryBuilder.andWhere(
        'quiz.statut = :statut',
        { statut },
      );
    }

    const [data, total] =
      await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: {
        formation: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${id} not found`,
      );
    }

    return quiz;
  }

  async create(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create(
      createQuizDto,
    );

    return this.quizRepository.save(quiz);
  }

  async update(
    id: string,
    updateQuizDto: UpdateQuizDto,
  ) {
    const quiz = await this.findOne(id);

    Object.assign(quiz, updateQuizDto);

    return this.quizRepository.save(quiz);
  }

  async remove(id: string) {
    const quiz = await this.findOne(id);

    await this.quizRepository.remove(quiz);

    return {
      message: 'Quiz deleted successfully',
    };
  }
}