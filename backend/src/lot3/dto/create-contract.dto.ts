import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateContractDto {
  @IsUUID() employee_id: string;
  @IsString() @MaxLength(40) type: string;
  @IsOptional() @IsString() @MaxLength(30) status?: string;
  @IsDateString() start_date: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsString() @MaxLength(120) job_title?: string;
  @IsOptional() @IsNumber() salary?: number;
}
