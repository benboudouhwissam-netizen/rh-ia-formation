import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsDateString()
  date_inscription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  statut?: string;
}
