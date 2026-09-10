import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmployeeDto {
  @IsString()
  @ApiProperty({ example: 'Wissam Benboudouh' })
  @IsNotEmpty()
  @MaxLength(150)
  nom_complet: string;

  @IsEmail()
  @ApiProperty({ example: 'wissam.ben@entro.com' })
  @MaxLength(254)
  email_professionnel: string;

  @IsString()
  @ApiProperty({ example: 'MotDePasse123!' })
  @MinLength(8)
  @MaxLength(128)
  mot_de_passe: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @ApiProperty({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', description: 'UUID du poste' })
  poste_id: string;

  @IsOptional()
  @IsIn(['CDI', 'CDD'])
  @ApiProperty({ enum: ['CDI', 'CDD'], required: false, example: 'CDI' })
  type_contrat?: 'CDI' | 'CDD';
}
