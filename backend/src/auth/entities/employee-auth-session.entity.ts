import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmployeeAccount } from './employee-account.entity';

@Entity('employee_auth_sessions')
export class EmployeeAuthSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employee_id: string;

  @ManyToOne(() => EmployeeAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeAccount;

  @Column({ name: 'token_hash', length: 64, unique: true })
  token_hash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
