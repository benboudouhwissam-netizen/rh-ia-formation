import { IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDiplomaDto {
  @IsUUID() employee_id: string;
  @IsString() @MaxLength(180) title: string;
  @IsOptional() @IsString() @MaxLength(180) institution?: string;
  @IsOptional() @IsString() @MaxLength(120) field?: string;
  @IsOptional() @IsInt() year?: number;
}
