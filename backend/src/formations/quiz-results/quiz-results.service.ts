import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizResult } from '../entities/quiz-result.entity';
import { CreateQuizResultDto } from '../dto/create-quiz-result.dto';
import { UpdateQuizResultDto } from '../dto/update-quiz-result.dto';
import { FilterQuizResultDto } from '../dto/filter-quiz-result.dto';

@Injectable()
export class QuizResultsService {
  constructor(
    @InjectRepository(QuizResult)
    private readonly repository: Repository<QuizResult>,
  ) {}

  async findAll(filters: FilterQuizResultDto) {
    const {
      quiz_id,
      utilisateur_id,
      reussi,
      limit = 10,
      offset = 0,
    } = filters;

    const where: any = {};

    if (quiz_id !== undefined) {
      where.quiz_id = quiz_id;
    }

    if (utilisateur_id !== undefined) {
      where.utilisateur_id = utilisateur_id;
    }

    if (reussi !== undefined) {
      where.reussi = reussi;
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: {
        quiz: true,
      },
      order: {
        date_passage: 'DESC',
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
    const result = await this.repository.findOne({
      where: { id },
      relations: {
        quiz: true,
      },
    });

    if (!result) {
      throw new NotFoundException(
        `Quiz result with ID ${id} not found`,
      );
    }

    return result;
  }

  async create(createDto: CreateQuizResultDto) {
    const result = this.repository.create(createDto);

    return this.repository.save(result);
  }

  async update(
    id: string,
    updateDto: UpdateQuizResultDto,
  ) {
    const result = await this.findOne(id);

    Object.assign(result, updateDto);

    return this.repository.save(result);
  }

  async remove(id: string) {
    const result = await this.findOne(id);

    await this.repository.remove(result);

    return {
      message: 'Quiz result deleted successfully',
    };
  }
}