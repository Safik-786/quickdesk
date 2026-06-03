import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ── Action type constants ────────────────────────────────────────────────────
export const AUDIT_ACTION = {
  TICKET_CREATED: 'TICKET_CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  CATEGORY_OVERRIDE: 'CATEGORY_OVERRIDE',
  PRIORITY_OVERRIDE: 'PRIORITY_OVERRIDE',
  REPLY_SENT: 'REPLY_SENT',
  TICKET_RESOLVED: 'TICKET_RESOLVED',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

interface LogInput {
  ticketId: string;
  agentId: string;
  action: AuditAction;
  field: string;
  from?: string;
  to?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generic audit log entry */
  async log(input: LogInput) {
    return this.prisma.auditLog.create({
      data: {
        ticketId: input.ticketId,
        agentId: input.agentId,
        action: input.action,
        field: input.field,
        fromValue: input.from ?? '',
        toValue: input.to ?? '',
      },
    });
  }

  /** Log ticket creation */
  async logTicketCreated(ticketId: string, employeeId: string) {
    return this.log({
      ticketId,
      agentId: employeeId,
      action: AUDIT_ACTION.TICKET_CREATED,
      field: 'status',
      from: '',
      to: 'open',
    });
  }

  /** Log a status change (e.g. open → in_progress) */
  async logStatusChange(
    ticketId: string,
    agentId: string,
    from: string,
    to: string,
  ) {
    return this.log({
      ticketId,
      agentId,
      action: AUDIT_ACTION.STATUS_CHANGED,
      field: 'status',
      from,
      to,
    });
  }

  /** Log a category override */
  async logCategoryOverride(
    ticketId: string,
    agentId: string,
    from: string,
    to: string,
  ) {
    return this.log({
      ticketId,
      agentId,
      action: AUDIT_ACTION.CATEGORY_OVERRIDE,
      field: 'category',
      from,
      to,
    });
  }

  /** Log a priority override */
  async logPriorityOverride(
    ticketId: string,
    agentId: string,
    from: string,
    to: string,
  ) {
    return this.log({
      ticketId,
      agentId,
      action: AUDIT_ACTION.PRIORITY_OVERRIDE,
      field: 'priority',
      from,
      to,
    });
  }

  /** Log a reply sent */
  async logReplySent(
    ticketId: string,
    userId: string,
    messagePreview: string,
  ) {
    return this.log({
      ticketId,
      agentId: userId,
      action: AUDIT_ACTION.REPLY_SENT,
      field: 'reply',
      from: '',
      to: messagePreview.substring(0, 100),
    });
  }

  /** Log ticket resolved */
  async logTicketResolved(
    ticketId: string,
    agentId: string,
    fromStatus: string,
  ) {
    return this.log({
      ticketId,
      agentId,
      action: AUDIT_ACTION.TICKET_RESOLVED,
      field: 'status',
      from: fromStatus,
      to: 'resolved',
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
