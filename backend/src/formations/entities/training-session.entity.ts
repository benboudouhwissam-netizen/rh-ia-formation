import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Formation } from './formation.entity';

@Entity('training_sessions')
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'formation_id',
    type: 'uuid',
  })
  formation_id: string;

  @ManyToOne(() => Formation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({
    name: 'date_debut',
    type: 'timestamptz',
  })
  date_debut: Date;

  @Column({
    name: 'date_fin',
    type: 'timestamptz',
    nullable: true,
  })
  date_fin: Date;

  @Column({
    length: 150,
    nullable: true,
  })
  lieu: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  capacite: number;

  @Column({
    length: 50,
    nullable: true,
  })
  statut: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}