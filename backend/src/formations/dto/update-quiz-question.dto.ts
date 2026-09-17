import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateQuizQuestionDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @IsOptional()
  ordre?: number;
}
