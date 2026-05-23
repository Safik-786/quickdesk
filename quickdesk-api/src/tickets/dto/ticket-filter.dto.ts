import { IsOptional, IsIn, IsString } from 'class-validator';

export class TicketFilterDto {
  @IsOptional()
  @IsIn(['open', 'resolved', 'closed'])
  status?: string;

  @IsOptional()
  @IsIn(['IT', 'HR', 'Finance', 'Admin', 'Other'])
  category?: string;

  @IsOptional()
  @IsIn(['Low', 'Medium', 'High'])
  priority?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
