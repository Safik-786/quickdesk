import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { RequestWithUser } from '../../auth/interfaces/jwt-user.interface';

@Injectable()
export class TicketRateLimitGuard implements CanActivate {
  // In-memory sliding window store: userId -> timestamps of submissions
  private readonly submissionsStore = new Map<string, number[]>();

  // Rate limit: Max 5 tickets per hour
  private readonly LIMIT = 5;
  private readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour in ms

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return true; // Bypass if not authenticated
    }

    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    // Get existing timestamps
    let timestamps = this.submissionsStore.get(user.id) || [];

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    if (timestamps.length >= this.LIMIT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many tickets submitted. You are limited to ${this.LIMIT} ticket submissions per hour.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current timestamp and store
    timestamps.push(now);
    this.submissionsStore.set(user.id, timestamps);

    return true;
  }
}
