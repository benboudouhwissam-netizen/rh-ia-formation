import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  // Compatible avec les UUID de démonstration historiques, valides en base.
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @IsNotEmpty()
  @ApiProperty({ example: 'c60b76a1-2048-4ada-aedf-fea328417af4' })
  formation_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiProperty({ example: 'Quiz - Développement backend' })
  titre: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Évalue les acquis de la formation.' })
  description?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 20, description: 'Durée en minutes' })
  duree?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ example: 70, description: 'Score minimal requis (en pourcentage)' })
  score_requis?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({ example: 'actif' })
  statut?: string;
}
