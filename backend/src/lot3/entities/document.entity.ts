import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'employee_id', type: 'uuid' }) employee_id: string;
  @Column({ type: 'varchar', length: 60 }) category: string;
  @Column({ type: 'varchar', length: 180 }) title: string;
  @Column({ name: 'storage_key', type: 'text', nullable: true }) storage_key?: string | null;
  @Column({ name: 'mime_type', type: 'varchar', length: 120, nullable: true }) mime_type?: string | null;
  @Column({ name: 'size_bytes', type: 'bigint', nullable: true }) size_bytes?: number | null;
  @Column({ name: 'ocr_text', type: 'text', nullable: true }) ocr_text?: string | null;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
