import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('rbac/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('RBAC.CREATE')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('RBAC.READ')
  findAll(@Query('module') module?: string) {
    return this.permissionsService.findAll(module);
  }

  @Get('grouped')
  @RequirePermissions('RBAC.READ')
  findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  @Get(':id')
  @RequirePermissions('RBAC.READ')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('RBAC.UPDATE')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('RBAC.DELETE')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
