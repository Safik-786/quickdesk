import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LegacyRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
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

    return this.signToken(user.id, user.email, user.legacyRole);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.legacyRole);
  }

  private signToken(userId: string, email: string, role: LegacyRole) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email, role },
    };
  }
}
