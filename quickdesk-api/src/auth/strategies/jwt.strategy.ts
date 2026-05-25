import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: (req) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (req && req.cookies) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          return req.cookies['access_token'];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<JwtUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
    };
  }
}
