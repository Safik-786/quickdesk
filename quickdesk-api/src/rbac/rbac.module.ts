import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { UserRolesService } from './user-roles.service';
import { PermissionsController } from './permissions.controller';
import { RolesController } from './roles.controller';
import { UserRolesController } from './user-roles.controller';

@Module({
  imports: [PrismaModule],
  providers: [PermissionsService, RolesService, UserRolesService],
  controllers: [PermissionsController, RolesController, UserRolesController],
  exports: [PermissionsService, RolesService, UserRolesService],
})
export class RbacModule {}
