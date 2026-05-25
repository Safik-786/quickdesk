import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AiClientService,
  type DraftReplyResult,
} from '../ai-client/ai-client.service';
import { AuditService } from '../audit/audit.service';
import { AppEventEmitter } from '../events/events.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OverrideTicketDto } from './dto/override-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { Prisma } from '@prisma/client';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { TicketsGateway } from '../sockets/tickets.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClient: AiClientService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: AppEventEmitter,
    private readonly gateway: TicketsGateway,
  ) {}

  async create(
    dto: CreateTicketDto,
    employeeId: string,
    screenshots: string[] = [],
  ) {
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
        screenshots,
        employeeId,
        aiCategory: classification.category,
        aiPriority: classification.priority,
        aiConfidence: classification.confidence,
        status: 'open',
      },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });

    // Emit asynchronous event for triaging notifications (Socket.IO + Email)
    this.eventEmitter.emit('ticket.created', ticket);

    return ticket;
  }

  async findMine(employeeId: string, filters: TicketFilterDto = {}) {
    const where: Prisma.TicketWhereInput = { employeeId };

    if (filters.status) {
      where.status = filters.status as Prisma.EnumTicketStatusFilter['equals'];
    }
    if (filters.category) where.agentCategory = filters.category;
    if (filters.priority) where.agentPriority = filters.priority;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setUTCHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findAll(filters: TicketFilterDto) {
    const where: Prisma.TicketWhereInput = {};

    if (filters.status) {
      where.status = filters.status as Prisma.EnumTicketStatusFilter['equals'];
    }
    if (filters.category) where.agentCategory = filters.category;
    if (filters.priority) where.agentPriority = filters.priority;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.date) {
      const startDate = new Date(filters.date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setUTCHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
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
        replies: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async getDraftReply(id: string): Promise<DraftReplyResult> {
    const ticket = await this.findOne(id);

    // Build conversation history from existing replies
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const conversationHistory = (ticket.replies || []).map((reply: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      sender: reply.user?.name || 'Unknown',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      message: reply.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      timestamp: new Date(reply.createdAt).toISOString(),
    }));

    const result = await this.aiClient.draftReply({
      title: ticket.title,
      description: ticket.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      conversationHistory,
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

    const updates: Prisma.TicketUpdateInput = {};
    const auditEntries: Promise<unknown>[] = [];

    if (dto.category !== undefined && dto.category !== ticket.agentCategory) {
      const from = ticket.agentCategory ?? ticket.aiCategory ?? '';
      updates.agentCategory = dto.category;
      auditEntries.push(
        this.auditService.log({
          ticketId: id,
          agentId,
          field: 'category',
          from,
          to: dto.category,
        }),
      );
    }

    if (dto.priority !== undefined && dto.priority !== ticket.agentPriority) {
      const from = ticket.agentPriority ?? ticket.aiPriority ?? '';
      updates.agentPriority = dto.priority;
      auditEntries.push(
        this.auditService.log({
          ticketId: id,
          agentId,
          field: 'priority',
          from,
          to: dto.priority,
        }),
      );
    }

    await Promise.all(auditEntries);
    return this.prisma.ticket.update({ where: { id }, data: updates });
  }

  async reply(id: string, dto: ReplyTicketDto, userId: string) {
    const ticket = await this.findOne(id);
    if (ticket.status === 'resolved') {
      throw new ForbiddenException('Ticket is already resolved');
    }

    // Determine if user is agent or employee based on logic in controller,
    // but here we just create a reply
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const reply = await this.prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: userId,
        message: dto.reply,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Update status to in_progress if it's the first reply and the ticket is still open
    if (ticket.status === 'open') {
      await this.prisma.ticket.update({
        where: { id },
        data: { status: 'in_progress' },
      });
    }

    // Broadcast via WebSockets
    this.gateway.broadcastTicketReply(id, reply);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return reply;
  }

  async resolveTicket(id: string, userId: string) {
    const ticket = await this.findOne(id);
    if (ticket.status === 'resolved') {
      throw new ForbiddenException('Ticket is already resolved');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedById: userId,
      },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });

    this.eventEmitter.emit('ticket.resolved', updated);
    return updated;
  }

  async updateTicket(id: string, dto: CreateTicketDto, employeeId: string) {
    const ticket = await this.findOne(id);

    // Only allow the ticket creator to update
    if (ticket.employeeId !== employeeId) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    // Don't allow updating resolved tickets
    if (ticket.status === 'resolved') {
      throw new ForbiddenException('Cannot update a resolved ticket');
    }

    // Re-classify with new content
    const classification = await this.aiClient.classify({
      title: dto.title,
      description: dto.description,
    });

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        aiCategory: classification.category,
        aiPriority: classification.priority,
        aiConfidence: classification.confidence,
        // Reset agent's custom category/priority when employee updates
        agentCategory: null,
        agentPriority: null,
      },
      include: { employee: { select: { id: true, name: true, email: true } } },
    });

    this.eventEmitter.emit('ticket.updated', updated);
    return updated;
  }

  async deleteTicket(id: string, employeeId: string) {
    const ticket = await this.findOne(id);

    // Only allow the ticket creator to delete
    if (ticket.employeeId !== employeeId) {
      throw new ForbiddenException('You can only delete your own tickets');
    }

    // Don't allow deleting in_progress or resolved tickets
    if (ticket.status !== 'open') {
      throw new ForbiddenException(
        'Can only delete open tickets. Close the ticket first.',
      );
    }

    // Hard delete ticket and associated audit logs
    await this.prisma.auditLog.deleteMany({ where: { ticketId: id } });
    
    const deleted = await this.prisma.ticket.delete({
      where: { id },
    });

    this.eventEmitter.emit('ticket.deleted', deleted);
    return deleted;
  }
}
