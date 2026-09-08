import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
 
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

export class FilterQuizQuestionDto {
  @IsUUID()
  @IsOptional()
  quiz_id?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}