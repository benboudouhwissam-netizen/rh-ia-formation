import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsDateString,
} from 'class-validator';

export class CreateTrainingSessionDto {
  // Les formations historiques emploient des UUID PostgreSQL valides sans
  // version RFC explicite (ex. 33333333-...).
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @IsNotEmpty()
  formation_id: string;

  @IsDateString()
  @IsNotEmpty()
  date_debut: string;

  @IsDateString()
  @IsOptional()
  date_fin?: string;

  @IsString()
  @IsOptional()
  lieu?: string;

  @IsInt()
  @IsOptional()
  capacite?: number;

  @IsString()
  @IsOptional()
  statut?: string;
}
