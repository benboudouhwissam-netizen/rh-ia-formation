import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Competence } from './competence.entity';

@Entity('employee_competences')
export class EmployeeCompetence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'utilisateur_id',
    type: 'uuid',
  })
  utilisateur_id: string;

  @Column({
    name: 'competence_id',
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
  niveau: number;

  @Column({
    length: 30,
    nullable: true,
  })
  source: string;

  @Column({
    type: 'timestamptz',
    name: 'date_evaluation',
    nullable: true,
  })
  date_evaluation: Date;
}
