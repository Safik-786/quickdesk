import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z_]+\.[A-Z_]+$/, {
    message: 'code must be in format MODULE.ACTION (e.g. USER.CREATE)',
  })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z_]+$/, { message: 'module must be uppercase letters and underscores' })
  module: string;
}
