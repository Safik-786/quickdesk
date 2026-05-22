import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser, RequestWithUser } from '../interfaces/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as JwtUser;
  },
);
