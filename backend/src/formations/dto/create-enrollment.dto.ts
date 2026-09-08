import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  // Les données de démonstration historiques utilisent des UUID hexadécimaux
  // valides pour PostgreSQL (ex. aaaaaaaa-...) mais sans version RFC.
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @ApiProperty({ example: 'c60b76a1-2048-4ada-aedf-fea328417af4' })
  utilisateur_id: string;

  @IsUUID()
  @ApiProperty({ example: 'a1d4f7b2-6c88-4e1a-9d92-0e3f1c8a55b7' })
  training_session_id: string;

  @IsDateString()
  @ApiProperty({ example: '2026-09-05' })
  date_inscription: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({ example: 'inscrit' })
  statut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @ApiPropertyOptional({ example: 'Wissam Benboudouh' })
  nom_complet?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  @ApiPropertyOptional({ example: 'wissam.ben@entro.com' })
  email_professionnel?: string;
}
