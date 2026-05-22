import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LogOverrideInput {
  ticketId: string;
  agentId: string;
  field: 'category' | 'priority';
  from: string;
  to: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: LogOverrideInput) {
    return this.prisma.auditLog.create({
      data: {
        ticketId: input.ticketId,
        agentId: input.agentId,
        field: input.field,
        fromValue: input.from,
        toValue: input.to,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.auditLog.findMany({
      where: { ticketId },
      include: { agent: { select: { id: true, name: true, email: true } } },
      orderBy: { changedAt: 'desc' },
    });
  }
}
