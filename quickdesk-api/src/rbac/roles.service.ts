import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.rbacRole.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new ConflictException(`Role code "${dto.code}" already exists`);
    return this.prisma.rbacRole.create({ data: dto });
  }

  async findAll() {
    return this.prisma.rbacRole.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { rolePermissions: true, userRoles: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.rbacRole.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
          orderBy: { permission: { code: 'asc' } },
        },
        _count: { select: { userRoles: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem && (dto.code || dto.name)) {
      throw new ForbiddenException('Cannot rename system roles');
    }
    return this.prisma.rbacRole.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem)
      throw new ForbiddenException('Cannot delete system roles');
    return this.prisma.rbacRole.delete({ where: { id } });
  }

  /** Replace all permissions on a role (full sync) */
  async syncPermissions(roleId: string, dto: AssignPermissionsDto) {
    await this.findOne(roleId);

    // Validate all permission IDs exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: dto.permissionIds } },
    });
    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('One or more permission IDs not found');
    }

    // Delete existing, then insert new (atomic)
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.findOne(roleId);
  }

  /** Add a single permission to a role */
  async addPermission(roleId: string, permissionId: string) {
    await this.findOne(roleId);
    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId },
      update: {},
    });
  }

  /** Remove a single permission from a role */
  async removePermission(roleId: string, permissionId: string) {
    await this.findOne(roleId);
    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
