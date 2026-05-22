import { IsArray, IsString, ArrayUnique } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  roleIds: string[];
}
