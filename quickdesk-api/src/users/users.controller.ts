import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesToUserDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users with their roles
   * Requires: RBAC.READ permission
   */
  @Get()
  @RequirePermissions('RBAC.READ')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.findAll(pageNum, limitNum);
  }

  /**
   * Get a specific user by ID
   * Requires: RBAC.READ permission
   */
  @Get(':id')
  @RequirePermissions('RBAC.READ')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Create a new user
   * Requires: RBAC.CREATE permission
   */
  @Post()
  @RequirePermissions('RBAC.CREATE')
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createWithPassword(
      dto.email,
      dto.password,
      dto.name,
      dto.isVerified,
    );

    // Assign roles if provided
    if (dto.roleIds && dto.roleIds.length > 0) {
      return this.usersService.assignRoles(user.id, dto.roleIds);
    }

    return user;
  }

  /**
   * Assign roles to a user
   * Requires: RBAC.MANAGE permission
   */
  @Post(':id/roles')
  @RequirePermissions('RBAC.MANAGE')
  async assignRolesToUser(
    @Param('id') userId: string,
    @Body() dto: AssignRolesToUserDto,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.usersService.assignRoles(userId, dto.roleIds, actor.id);
  }

  /**
   * Toggle user verification status
   * Requires: RBAC.MANAGE permission
   */
  @Patch(':id/verify')
  @RequirePermissions('RBAC.MANAGE')
  async toggleVerification(
    @Param('id') userId: string,
    @Body('isVerified') isVerified: boolean,
  ) {
    return this.usersService.toggleVerification(userId, isVerified);
  }
}
