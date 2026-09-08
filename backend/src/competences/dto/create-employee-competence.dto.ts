import { IsIn, IsInt, IsOptional, IsUUID, Matches, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeCompetenceDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  @ApiProperty({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  utilisateur_id: string;

  @IsUUID()
  @ApiProperty({ example: '6c730377-1d3b-4ca1-9e7d-6eea9e7d4473' })
  competence_id: string;

  @IsInt()
  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @Min(1)
  @Max(5)
  niveau: number;

  @IsOptional()
  @ApiPropertyOptional({ enum: ['auto_evalue', 'manager', 'certifie', 'ia_estime', 'quiz'], example: 'auto_evalue' })
  @IsIn(['auto_evalue', 'manager', 'certifie', 'ia_estime', 'quiz'])
  source?: string;
}
