import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new ConflictException(
        `Permission code "${dto.code}" already exists`,
      );
    return this.prisma.permission.create({ data: dto });
  }

  async findAll(module?: string) {
    return this.prisma.permission.findMany({
      where: module ? { module } : undefined,
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string) {
    const perm = await this.prisma.permission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async findByCode(code: string) {
    return this.prisma.permission.findUnique({ where: { code } });
  }

  async update(id: string, dto: UpdatePermissionDto) {
    await this.findOne(id);
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.permission.delete({ where: { id } });
  }

  /** Returns all permission codes a user has via their assigned roles */
  async getUserPermissionCodes(userId: string): Promise<Set<string>> {
    const userRoles = await this.prisma.userRole.findMany({
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

    const codes = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.rolePermissions) {
        codes.add(rp.permission.code);
      }
    }
    return codes;
  }

  async userHasPermission(userId: string, code: string): Promise<boolean> {
    const codes = await this.getUserPermissionCodes(userId);
    return codes.has(code);
  }

  /** Grouped by module for the UI */
  async findAllGrouped() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }
    return grouped;
  }
}
