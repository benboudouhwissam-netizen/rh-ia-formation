import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateQuizQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  quiz_id: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @IsOptional()
  ordre?: number;
}