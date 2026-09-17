import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Formation } from './formation.entity';

@Entity('link_certifications_formations')
export class LinkCertificationFormation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'certification_id',
    type: 'uuid',
  })
  certification_id: string;

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

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;
}
