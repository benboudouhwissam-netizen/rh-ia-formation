import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginEmployeeDto {
  @IsEmail()
  @ApiProperty({ example: 'wissam.ben@entro.com' })
  @MaxLength(254)
  email_professionnel: string;

  @IsString()
  @ApiProperty({ example: 'MotDePasse123!' })
  @MinLength(8)
  @MaxLength(128)
  mot_de_passe: string;
}
