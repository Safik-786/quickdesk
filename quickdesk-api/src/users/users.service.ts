import { Injectable } from '@nestjs/common';
import { LegacyRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  legacyRole: LegacyRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        legacyRole: true,
        createdAt: true,
      },
    });
  }
}
