import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRolesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get all roles assigned to a user */
  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.userRole.findMany({
      where: { userId },
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
  }

  /** Assign a role to a user */
  async assignRole(userId: string, roleId: string, grantedBy?: string) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.rbacRole.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) throw new ConflictException('User already has this role');

    return this.prisma.userRole.create({
      data: { userId, roleId, grantedBy },
      include: { role: true },
    });
  }

  /** Remove a role from a user */
  async revokeRole(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) throw new NotFoundException('User does not have this role');
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  /** Sync all roles for a user (replace) */
  async syncUserRoles(userId: string, roleIds: string[], grantedBy?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const roles = await this.prisma.rbacRole.findMany({
      where: { id: { in: roleIds } },
    });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more role IDs not found');
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId, grantedBy })),
        skipDuplicates: true,
      }),
    ]);

    return this.getUserRoles(userId);
  }

  /** Get all users with their roles (for admin view) */
  async getAllUsersWithRoles() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        userRoles: {
          include: { role: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
