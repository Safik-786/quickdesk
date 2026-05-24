import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestWithUser } from '../interfaces/jwt-user.interface';
import { ROLE } from '../constants/roles.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) throw new ForbiddenException('Insufficient permissions');

    // Fetch user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const userRoleCodes = userRoles.map((ur) => ur.role.code);

    // Admin bypass
    if (userRoleCodes.includes(ROLE.ADMIN)) return true;

    if (!requiredRoles.some((r) => userRoleCodes.includes(r))) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
