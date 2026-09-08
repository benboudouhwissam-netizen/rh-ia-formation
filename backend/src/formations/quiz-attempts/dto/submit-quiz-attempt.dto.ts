import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReponseQuestionDto {
  @IsUUID()
  @ApiProperty({ example: 'cd8ad2cc-662d-4cc3-b03b-1d7c0a511d3f' })
  question_id: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({ type: [String], example: ['c9cae2a9-3553-45c9-9d7a-1c7f3a41a291'] })
  answer_ids?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Une API REST expose des ressources par HTTP.' })
  texte_libre?: string;
}

export class SubmitQuizAttemptDto {
  @IsUUID()
  @ApiProperty({ example: '95df31ce-5151-4f5f-8f48-9b234c1b65d0' })
  quiz_id: string;

  @IsString()
  @ApiProperty({ example: 'c60b76a1-2048-4ada-aedf-fea328417af4' })
  utilisateur_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReponseQuestionDto)
  @ApiProperty({ type: [ReponseQuestionDto] })
  reponses: ReponseQuestionDto[];
}

export class CreateFormationDtoExample {
  @ApiProperty({ example: 'Développement backend avec NestJS' })
  titre: string;
 
  @ApiPropertyOptional({
    example: 'Concevoir des API robustes et modulaires avec NestJS, TypeORM et une architecture propre.',
  })
  description?: string;
 
  @ApiPropertyOptional({ example: 'Backend' })
  categorie?: string;
 
  @ApiPropertyOptional({ example: 'Intermédiaire', enum: ['Débutant', 'Intermédiaire', 'Avancé'] })
  niveau?: string;
 
  @ApiPropertyOptional({ example: 100, description: 'Durée en minutes' })
  duree?: number;
 
  @ApiPropertyOptional({ example: 'active' })
  statut?: string;
}
