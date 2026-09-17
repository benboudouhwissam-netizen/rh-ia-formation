import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Quiz } from './quiz.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'quiz_id',
    type: 'uuid',
  })
  quiz_id: string;

  @ManyToOne(() => Quiz, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({
    name: 'utilisateur_id',
    type: 'uuid',
  })
  utilisateur_id: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  score: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  score_max: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  reussi: boolean;

  @Column({
    name: 'date_passage',
    type: 'timestamp',
    nullable: true,
  })
  date_passage: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
