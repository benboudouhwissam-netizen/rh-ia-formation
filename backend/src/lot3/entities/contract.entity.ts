import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'employee_id', type: 'uuid' }) employee_id: string;
  @Column({ type: 'varchar', length: 40 }) type: string;
  @Column({ type: 'varchar', length: 30, default: 'actif' }) status: string;
  @Column({ name: 'start_date', type: 'date' }) start_date: string;
  @Column({ name: 'end_date', type: 'date', nullable: true }) end_date?:
    string | null;
  @Column({ name: 'job_title', type: 'varchar', length: 120, nullable: true })
  job_title?: string | null;
  @Column({ type: 'numeric', nullable: true }) salary?: number | null;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
