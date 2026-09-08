import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Formation } from './formation.entity';
import { Competence } from '../../competences/entities/competence.entity';

@Entity('formation_competences')
export class FormationCompetence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'formation_id' })
  formation_id: string;

  @ManyToOne(() => Formation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({ name: 'competence_id' })
  competence_id: string;

  @ManyToOne(() => Competence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competence_id' })
  competence: Competence;

  @Column({ name: 'niveau_vise', type: 'smallint', nullable: true })
  niveau_vise: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
