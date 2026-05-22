import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rbac/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  /** List all users with their roles (admin view) */
  @Get()
  @RequirePermissions('RBAC.READ')
  getAllUsersWithRoles() {
    return this.userRolesService.getAllUsersWithRoles();
  }

  /** Get roles for a specific user */
  @Get(':userId/roles')
  @RequirePermissions('RBAC.READ')
  getUserRoles(@Param('userId') userId: string) {
    return this.userRolesService.getUserRoles(userId);
  }

  /** Sync all roles for a user (full replace) */
  @Post(':userId/roles/sync')
  @RequirePermissions('RBAC.MANAGE')
  syncUserRoles(
    @Param('userId') userId: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() actor: any,
  ) {
    return this.userRolesService.syncUserRoles(userId, dto.roleIds, actor.id);
  }

  /** Assign a single role to a user */
  @Post(':userId/roles/:roleId')
  @RequirePermissions('RBAC.MANAGE')
  assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() actor: any,
  ) {
    return this.userRolesService.assignRole(userId, roleId, actor.id);
  }

  /** Revoke a single role from a user */
  @Delete(':userId/roles/:roleId')
  @RequirePermissions('RBAC.MANAGE')
  revokeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.revokeRole(userId, roleId);
  }
}
