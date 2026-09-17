import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceEvent } from '../entities/performance-event.entity';

@Injectable()
export class PerformanceEventsService {
  constructor(
    @InjectRepository(PerformanceEvent)
    private readonly eventRepository: Repository<PerformanceEvent>,
  ) {}

  publish(
    input: Pick<
      PerformanceEvent,
      'utilisateur_id' | 'type' | 'reference_id' | 'payload'
    >,
  ) {
    return this.eventRepository.save(this.eventRepository.create(input));
  }

  findForUser(utilisateurId: string) {
    return this.eventRepository.find({
      where: { utilisateur_id: utilisateurId },
      order: { created_at: 'DESC' },
    });
  }
}
