import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterCertificationDto {
  @IsOptional()
  @IsUUID()
  utilisateur_id?: string;

  @IsOptional()
  @IsUUID()
  competence_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}