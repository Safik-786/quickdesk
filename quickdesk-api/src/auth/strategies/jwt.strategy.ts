import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LegacyRole } from '@prisma/client';
import { UsersService } from '../../users/users.service';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: LegacyRole;
  }): Promise<JwtUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      role: user.legacyRole,
      legacyRole: user.legacyRole,
      name: user.name,
    };
  }
}
