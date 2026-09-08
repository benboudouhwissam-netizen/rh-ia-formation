import { IsBoolean, IsDateString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizResultDto {
  @IsUUID()
  quiz_id: string;

  @IsUUID()
  utilisateur_id: string;

  @IsOptional()
  @IsInt()
  score?: number;

  @IsOptional()
  @IsInt()
  score_max?: number;

  @IsOptional()
  @IsBoolean()
  reussi?: boolean;

  @IsOptional()
  @IsDateString()
  date_passage?: string;
}