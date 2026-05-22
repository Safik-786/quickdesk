import { IsArray, IsString, ArrayUnique } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  permissionIds: string[];
}
