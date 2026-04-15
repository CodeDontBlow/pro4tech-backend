import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

type RequestWithUser = Request & {
  user?: {
    sub?: string;
  };
};

@Injectable()
export class TicketCreateRateLimitGuard implements CanActivate {
  private readonly requestHistoryByTracker = new Map<string, number[]>();
  private readonly maxRequests = this.readPositiveIntEnv(
    'TICKET_CREATE_RATE_LIMIT_MAX',
    5,
  );
  private readonly windowMs = this.readPositiveIntEnv(
    'TICKET_CREATE_RATE_LIMIT_WINDOW_MS',
    60_000,
  );

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const tracker = request.user?.sub || request.ip || 'anonymous';

    const now = Date.now();
    const windowStart = now - this.windowMs;
    const history = this.requestHistoryByTracker.get(tracker) ?? [];
    const recentRequests = history.filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      throw new HttpException(
        `Limite excedido: máximo de ${this.maxRequests} chamados por ${Math.floor(this.windowMs / 1000)} segundos`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recentRequests.push(now);
    this.requestHistoryByTracker.set(tracker, recentRequests);

    return true;
  }

  private readPositiveIntEnv(envName: string, fallback: number): number {
    const value = process.env[envName];
    if (!value) {
      return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }
}
