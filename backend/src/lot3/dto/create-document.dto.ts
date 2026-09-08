import { IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDocumentDto {
  @IsUUID() employee_id: string;
  @IsString() @MaxLength(60) category: string;
  @IsString() @MaxLength(180) title: string;
  @IsOptional() @IsString() storage_key?: string;
  @IsOptional() @IsString() @MaxLength(120) mime_type?: string;
  @IsOptional() @IsInt() size_bytes?: number;
  @IsOptional() @IsString() ocr_text?: string;
}
