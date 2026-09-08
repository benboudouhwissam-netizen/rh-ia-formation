import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdateTrainingSessionDto {
  @IsUUID()
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