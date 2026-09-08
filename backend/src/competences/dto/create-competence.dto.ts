import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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

export class CreateCompetenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categorie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  niveau?: string;
}