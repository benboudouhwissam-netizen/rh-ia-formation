import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateQuizResultDto {
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
