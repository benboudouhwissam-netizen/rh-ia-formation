import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterQuizAnswerDto {
  @IsOptional()
  @IsUUID()
  question_id?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  est_correcte?: boolean;

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
