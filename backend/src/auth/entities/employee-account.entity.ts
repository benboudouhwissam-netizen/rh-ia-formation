import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('employee_accounts')
export class EmployeeAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nom_complet' })
  nom_complet: string;

  @Column({ name: 'email_professionnel', unique: true })
  email_professionnel: string;

  @Column({ name: 'password_hash', select: false })
  password_hash: string;

  @Column({ name: 'poste_id', type: 'uuid' })
  poste_id: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatar_url?: string | null;

  @Column({ name: 'type_contrat', type: 'varchar', length: 20, nullable: true })
  type_contrat?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true }) matricule?: string | null;
  @Column({ name: 'first_name', type: 'varchar', length: 80, nullable: true }) first_name?: string | null;
  @Column({ name: 'last_name', type: 'varchar', length: 80, nullable: true }) last_name?: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) phone?: string | null;
  @Column({ name: 'birth_date', type: 'date', nullable: true }) birth_date?: string | null;
  @Column({ type: 'text', nullable: true }) address?: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) city?: string | null;
  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true }) postal_code?: string | null;
  @Column({ type: 'varchar', length: 80, nullable: true }) country?: string | null;
  @Column({ name: 'hire_date', type: 'date', nullable: true }) hire_date?: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true, default: 'actif' }) status?: string | null;
  @Column({ name: 'job_title', type: 'varchar', length: 120, nullable: true }) job_title?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
