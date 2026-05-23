import { IsArray } from 'class-validator';

export class AssignRolesToUserDto {
  @IsArray()
  roleIds: string[];
}
