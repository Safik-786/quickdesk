import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser, RequestWithUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required — allow through
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) throw new ForbiddenException('Not authenticated');
    const authUser: JwtUser = user;

    // Load user's permission codes via their RBAC roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: authUser.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const userPermissionCodes = new Set<string>();
    for (const ur of userRoles) {
      if (ur.role.code === 'ADMIN') return true; // RBAC admin bypass
      for (const rp of ur.role.rolePermissions) {
        userPermissionCodes.add(rp.permission.code);
      }
    }

    // Check all required permissions are present
    const hasAll = requiredPermissions.every((p) => userPermissionCodes.has(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Missing required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
