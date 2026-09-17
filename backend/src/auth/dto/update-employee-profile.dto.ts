import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmployeeProfileDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'Wissam Benboudouh' })
  @IsString()
  @MaxLength(120)
  nom_complet?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'wissam.ben@entro.com' })
  @IsEmail()
  @MaxLength(160)
  email_professionnel?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' })
  @IsString()
  @MaxLength(80)
  poste_id?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: ['CDI', 'CDD'], example: 'CDI' })
  @IsIn(['CDI', 'CDD'])
  type_contrat?: 'CDI' | 'CDD';

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Photo encodée en Data URL',
    example: 'data:image/jpeg;base64,...',
  })
  @IsString()
  @MaxLength(3_000_000)
  avatar_url?: string;

  @IsOptional() @IsString() @MaxLength(50) matricule?: string;
  @IsOptional() @IsString() @MaxLength(80) first_name?: string;
  @IsOptional() @IsString() @MaxLength(80) last_name?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsString() @MaxLength(10) birth_date?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(20) postal_code?: string;
  @IsOptional() @IsString() @MaxLength(80) country?: string;
  @IsOptional() @IsString() @MaxLength(10) hire_date?: string;
  @IsOptional() @IsString() @MaxLength(30) status?: string;
  @IsOptional() @IsString() @MaxLength(120) job_title?: string;
}
