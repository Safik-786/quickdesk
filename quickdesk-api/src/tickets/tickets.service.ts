import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiClientService } from '../ai-client/ai-client.service';
import { AuditService } from '../audit/audit.service';
import { TicketsGateway } from '../sockets/tickets.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OverrideTicketDto } from './dto/override-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClient: AiClientService,
    private readonly auditService: AuditService,
    private readonly gateway: TicketsGateway,
  ) {}

  async create(dto: CreateTicketDto, employeeId: string) {
    // Call AI service for classification
    const classification = await this.aiClient.classify({
      title: dto.title,
      description: dto.description,
    });

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        attachmentFilename: dto.attachmentFilename ?? null,
        employeeId,
        aiCategory: classification.category,
        aiPriority: classification.priority,
        status: 'open',
      },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });

    // Notify all agents via Socket.IO
    this.gateway.notifyNewTicket(ticket);

    return ticket;
  }

  async findMine(employeeId: string) {
    return this.prisma.ticket.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(filters: TicketFilterDto) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.agentCategory = filters.category;
    if (filters.priority) where.agentPriority = filters.priority;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    return this.prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true, email: true } },
        auditLogs: {
          include: { agent: { select: { id: true, name: true, email: true } } },
          orderBy: { changedAt: 'desc' },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getDraftReply(id: string) {
    const ticket = await this.findOne(id);

    const result = await this.aiClient.draftReply({
      title: ticket.title,
      description: ticket.description,
    });

    // Store the AI draft on the ticket
    await this.prisma.ticket.update({
      where: { id },
      data: { aiDraft: result.draft, citations: result.citations },
    });

    return result;
  }

  async override(id: string, dto: OverrideTicketDto, agentId: string) {
    const ticket = await this.findOne(id);

    const updates: any = {};
    const auditEntries: Promise<any>[] = [];

    if (dto.category !== undefined && dto.category !== ticket.agentCategory) {
      const from = ticket.agentCategory ?? ticket.aiCategory;
      updates.agentCategory = dto.category;
      auditEntries.push(
        this.auditService.log({ ticketId: id, agentId, field: 'category', from, to: dto.category }),
      );
    }

    if (dto.priority !== undefined && dto.priority !== ticket.agentPriority) {
      const from = ticket.agentPriority ?? ticket.aiPriority;
      updates.agentPriority = dto.priority;
      auditEntries.push(
        this.auditService.log({ ticketId: id, agentId, field: 'priority', from, to: dto.priority }),
      );
    }

    await Promise.all(auditEntries);
    return this.prisma.ticket.update({ where: { id }, data: updates });
  }

  async reply(id: string, dto: ReplyTicketDto, agentId: string) {
    const ticket = await this.findOne(id);
    if (ticket.status === 'resolved') {
      throw new ForbiddenException('Ticket is already resolved');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        finalReply: dto.reply,
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedById: agentId,
      },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });

    // Notify the employee via Socket.IO
    this.gateway.notifyTicketResolved(updated);

    return updated;
  }
}
