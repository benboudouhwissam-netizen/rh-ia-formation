import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'utilisateur_id', type: 'uuid' })
  utilisateur_id: string;

  @Column({ name: 'competence_id', type: 'uuid' })
  competence_id: string;

  @Column({ name: 'nom_certification', length: 150 })
  nom_certification: string;

  @Column({ length: 150, nullable: true })
  organisme: string | null;

  @Column({ name: 'date_obtention', type: 'date' })
  date_obtention: string;

  @Column({ name: 'date_expiration', type: 'date', nullable: true })
  date_expiration: string | null;
}
