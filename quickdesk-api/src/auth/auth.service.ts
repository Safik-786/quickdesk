import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    // Assign default role (EMPLOYEE)
    const employeeRole = await this.prisma.rbacRole.findUnique({
      where: { code: 'EMPLOYEE' }
    });
    if (employeeRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: employeeRole.id,
        }
      });
    }

    return await this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return await this.signToken(user.id, user.email);
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

      return await this.signToken(user.id, user.email);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    // Generate tokens
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
    });

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersService.update(userId, { hashedRefreshToken });

    // Fetch Roles Metadata
    let roles: any[] = [];
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    roles = userRoles.map(ur => ({
      code: ur.role.code,
      name: ur.role.name,
      description: ur.role.description,
    }));

    // Fetch Permissions
    let permissions: string[] = [];
    if (roles.some(r => r.code === 'ADMIN')) {
      permissions = ['*'];
    } else {
      const permSet = await this.permissionsService.getUserPermissionCodes(userId);
      permissions = Array.from(permSet);
    }

    return {
      access_token,
      refresh_token,
      user: { id: userId, email, roles, permissions },
    };
  }
}
