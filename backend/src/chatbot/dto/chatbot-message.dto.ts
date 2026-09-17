import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatbotMessageDto {
  @IsOptional()
  @IsUUID('all')
  @ApiPropertyOptional({
    description: 'UUID de l’employé ; absent en mode visiteur',
  })
  utilisateur_id?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  @ApiProperty({ example: 'Quelles formations sont adaptées à mon poste ?' })
  message: string;
}
