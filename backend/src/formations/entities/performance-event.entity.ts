import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('performance_events')
export class PerformanceEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'utilisateur_id', type: 'uuid' })
  utilisateur_id: string;

  @Column({ length: 50 })
  type: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
