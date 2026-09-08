import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('diplomas')
export class Diploma {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'employee_id', type: 'uuid' }) employee_id: string;
  @Column({ type: 'varchar', length: 180 }) title: string;
  @Column({ type: 'varchar', length: 180, nullable: true }) institution?: string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) field?: string | null;
  @Column({ type: 'integer', nullable: true }) year?: number | null;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
