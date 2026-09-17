import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('learning_tasks')
export class LearningTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'utilisateur_id', type: 'uuid' })
  utilisateur_id: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, default: 'a_faire' })
  statut: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
