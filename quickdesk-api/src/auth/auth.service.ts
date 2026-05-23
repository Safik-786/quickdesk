import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LegacyRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../rbac/permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const legacyRole: LegacyRole = dto.role ?? LegacyRole.employee;
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      legacyRole,
    });

    return await this.signToken(user.id, user.email, user.legacyRole);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return await this.signToken(user.id, user.email, user.legacyRole);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
      });
      
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const valid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
      if (!valid) throw new UnauthorizedException('Invalid refresh token');

      return await this.signToken(user.id, user.email, user.legacyRole);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async signToken(userId: string, email: string, role: LegacyRole) {
    const payload = { sub: userId, email, role };
    
    // Generate tokens
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersService.update(userId, { hashedRefreshToken });

    // Fetch Permissions
    let permissions: string[] = [];
    if (role === 'admin') {
      permissions = ['*'];
    } else {
      const permSet = await this.permissionsService.getUserPermissionCodes(userId);
      permissions = Array.from(permSet);
    }

    // Fetch Roles Metadata
    let roles = [];
    if (role === 'admin') {
      const adminRole = await this.prisma.rbacRole.findUnique({ where: { code: 'ADMIN' } });
      if (adminRole) roles.push({ code: adminRole.code, name: adminRole.name, description: adminRole.description });
    } else {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
      });
      roles = userRoles.map(ur => ({
        code: ur.role.code,
        name: ur.role.name,
        description: ur.role.description,
      }));
    }

    return {
      access_token,
      refresh_token,
      user: { id: userId, email, role, roles, permissions },
    };
  }
}
