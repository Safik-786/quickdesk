import { IsOptional, IsIn } from 'class-validator';

export class OverrideTicketDto {
  @IsOptional()
  @IsIn(['IT', 'HR', 'Finance', 'Admin', 'Other'])
  category?: string;

  @IsOptional()
  @IsIn(['Low', 'Medium', 'High'])
  priority?: string;
}
