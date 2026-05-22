import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentFilename?: string;
}
