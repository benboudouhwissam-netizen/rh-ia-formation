import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  IsDateString,
} from 'class-validator';

export class UpdateTrainingSessionDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @IsOptional()
  formation_id?: string;

  @IsDateString()
  @IsOptional()
  date_debut?: string;

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
