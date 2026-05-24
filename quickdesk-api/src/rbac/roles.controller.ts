import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('rbac/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('RBAC.CREATE')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @RequirePermissions('RBAC.READ')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('RBAC.READ')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /** Get all permissions for a specific role */
  @Get(':id/permissions')
  @RequirePermissions('RBAC.READ')
  async getRolePermissions(@Param('id') id: string) {
    const role = await this.rolesService.findOne(id);
    return role.rolePermissions.map((rp) => rp.permission);
  }

  @Patch(':id')
  @RequirePermissions('RBAC.UPDATE')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('RBAC.DELETE')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  // ── Permission assignment ──────────────────────────────────────────────────

  /** Full sync: replace all permissions on a role */
  @Post(':id/permissions')
  @RequirePermissions('RBAC.MANAGE')
  syncPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.syncPermissions(id, dto);
  }

  /** Alternative endpoint for full sync (deprecated, use POST :id/permissions) */
  @Post(':id/permissions/sync')
  @RequirePermissions('RBAC.MANAGE')
  syncPermissionsOld(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.syncPermissions(id, dto);
  }

  /** Add a single permission */
  @Post(':id/permissions/:permissionId')
  @RequirePermissions('RBAC.MANAGE')
  addPermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.addPermission(id, permissionId);
  }

  /** Remove a single permission */
  @Delete(':id/permissions/:permissionId')
  @RequirePermissions('RBAC.MANAGE')
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removePermission(id, permissionId);
  }
}
