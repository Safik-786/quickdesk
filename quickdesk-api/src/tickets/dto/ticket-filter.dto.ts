import { IsOptional, IsIn, IsString } from 'class-validator';

export class TicketFilterDto {
  @IsOptional()
  @IsIn(['open', 'resolved'])
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
}
