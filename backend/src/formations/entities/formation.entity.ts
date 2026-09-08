import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('formations')
export class Formation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  titre: string;

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

  @Column({
    type: 'integer',
    nullable: true,
  })
  duree: number;

  @Column({
    length: 50,
    nullable: true,
  })
  statut: string;

  @Column({
    type: 'vector',
    nullable: true,
    select: false,
  })
  embedding: number[];

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}