import { IsBoolean, IsDateString, IsInt, IsOptional, IsUUID, Matches } from 'class-validator';

export class CreateQuizResultDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
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
