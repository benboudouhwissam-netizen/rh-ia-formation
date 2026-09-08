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

@Entity('quiz_questions')
export class QuizQuestion {
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
    type: 'text',
  })
  question: string;

  @Column({
    length: 50,
    nullable: true,
  })
  type: string;

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