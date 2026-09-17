import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('competences')
export class Competence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nom: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    length: 80,
    nullable: true,
  })
  categorie: string;

  @Column({
    length: 50,
    nullable: true,
  })
  niveau: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;

  @Column({
    type: 'vector',
    nullable: true,
  })
  embedding: number[];
}
