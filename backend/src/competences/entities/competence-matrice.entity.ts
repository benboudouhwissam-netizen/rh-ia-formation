import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Competence } from './competence.entity';

@Entity('competence_matrices')
export class CompetenceMatrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
  })
  poste_id: string;

  @Column({
    type: 'uuid',
  })
  competence_id: string;

  @ManyToOne(() => Competence, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'competence_id' })
  competence: Competence;

  @Column({
    type: 'smallint',
  })
  niveau_requis: number;
}