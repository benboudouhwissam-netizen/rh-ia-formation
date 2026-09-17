import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormationDto {
  @IsString()
  @ApiProperty({ example: 'Développement backend avec NestJS' })
  @MaxLength(150)
  titre: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Concevoir des API robustes avec NestJS.' })
  @IsString()
  description?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Backend' })
  @IsString()
  @MaxLength(80)
  categorie?: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: 'Intermédiaire',
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
  })
  @IsString()
  niveau?: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: 'presentiel',
    enum: ['presentiel', 'e_learning'],
  })
  @IsString()
  modalite?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 100, description: 'Durée en minutes' })
  @IsInt()
  duree?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'active' })
  @IsString()
  @MaxLength(50)
  statut?: string;
}
