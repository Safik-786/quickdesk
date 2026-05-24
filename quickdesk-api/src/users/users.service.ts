import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }

  async createWithPassword(
    email: string,
    password: string,
    name?: string,
    isVerified?: boolean,
  ) {
    // Check if user exists
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        isVerified: isVerified ?? true, // Auto-verify when created by admin unless explicitly false
      },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, count] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async assignRoles(userId: string, roleIds: string[], grantedBy?: string) {
    // Verify user exists
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify all roles exist
    const roles = await this.prisma.rbacRole.findMany({
      where: { id: { in: roleIds } },
    });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Sync roles (delete all existing, then add new ones)
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
          grantedBy,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.findById(userId);
  }

  async toggleVerification(userId: string, isVerified: boolean) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
      },
    });
  }
}
