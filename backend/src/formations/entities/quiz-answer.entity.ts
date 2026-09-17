import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'question_id',
    type: 'uuid',
  })
  question_id: string;

  @ManyToOne(() => QuizQuestion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @Column({
    type: 'text',
  })
  answer: string;

  @Column({
    name: 'est_correcte',
    type: 'boolean',
    default: false,
  })
  est_correcte: boolean;

  @Column({
    type: 'integer',
    nullable: true,
  })
  ordre: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
