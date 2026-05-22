import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  reply: string;
}
