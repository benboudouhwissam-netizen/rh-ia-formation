import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCertificationDto {
  @ApiProperty({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @IsUUID()
  utilisateur_id: string;

  @ApiProperty({ example: '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58' })
  @IsUUID()
  competence_id: string;

  @ApiProperty({ example: 'AWS Certified Developer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom_certification: string;

  @ApiPropertyOptional({ example: 'Amazon Web Services' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  organisme?: string;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Format ISO (YYYY-MM-DD)',
  })
  @IsDateString()
  date_obtention: string;

  @ApiPropertyOptional({
    example: '2029-01-15',
    description: 'Format ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date_expiration?: string;
}
