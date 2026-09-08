import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TrainingSession } from './training-session.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'utilisateur_id',
    type: 'uuid',
  })
  utilisateur_id: string;

  @Column({
    name: 'training_session_id',
    type: 'uuid',
  })
  training_session_id: string;

  @ManyToOne(() => TrainingSession, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'training_session_id' })
  training_session: TrainingSession;

  @Column({
    name: 'date_inscription',
    type: 'timestamptz',
    default: () => 'now()',
  })
  date_inscription: Date;

  @Column({
    length: 50,
    nullable: true,
  })
  statut: string;

  @Column({ length: 150, nullable: true })
  nom_complet: string | null;

  @Column({ length: 254, nullable: true })
  email_professionnel: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
