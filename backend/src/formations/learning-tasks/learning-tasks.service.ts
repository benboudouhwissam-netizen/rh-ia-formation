import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningTask } from '../entities/learning-task.entity';

@Injectable()
export class LearningTasksService {
  constructor(
    @InjectRepository(LearningTask)
    private readonly taskRepository: Repository<LearningTask>,
  ) {}

  async create(
    input: Pick<
      LearningTask,
      'utilisateur_id' | 'type' | 'reference_id' | 'message' | 'payload'
    >,
  ) {
    return this.taskRepository.save(this.taskRepository.create(input));
  }

  async findForUser(utilisateurId: string) {
    return this.taskRepository.find({
      where: { utilisateur_id: utilisateurId },
      order: { created_at: 'DESC' },
    });
  }
}
