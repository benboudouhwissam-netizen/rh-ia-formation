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

@Entity('quiz')
export class Quiz {
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
    length: 150,
  })
  titre: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  duree: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  score_requis: number;

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