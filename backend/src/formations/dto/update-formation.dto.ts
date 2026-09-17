import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFormationDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  titre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  categorie?: string;

  @IsString()
  @IsOptional()
  niveau?: string;

  @IsString()
  @IsOptional()
  modalite?: string;

  @IsInt()
  @IsOptional()
  duree?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  statut?: string;
}
