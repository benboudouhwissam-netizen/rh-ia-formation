import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizAnswerDto {
  @ApiProperty({
    example: '5d2e9ba1-347b-476e-a68c-a5c87f35134a',
    description: 'UUID de la question à laquelle cette réponse est rattachée',
  })
  @IsUUID()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty({
    example:
      "Aligner les compétences des employés avec les besoins de l'entreprise",
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indique si cette proposition est la bonne réponse',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  est_correcte?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: "Ordre d'affichage de la réponse",
  })
  @IsOptional()
  @IsInt()
  ordre?: number;
}
