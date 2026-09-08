import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

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

export class FilterCompetenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  categorie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  niveau?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}