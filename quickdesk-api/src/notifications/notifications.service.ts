import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { AppEventEmitter } from '../events/events.service';
import { TicketsGateway } from '../sockets/tickets.gateway';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

interface TicketPayload extends Ticket {
  employee?: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly eventEmitter: AppEventEmitter,
    private readonly gateway: TicketsGateway,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Registering Event-Driven Notification listeners...');

    // 1. Ticket Created Event Listener (Promise Safe)
    this.eventEmitter.on('ticket.created', (payload: TicketPayload) => {
      void (async () => {
        try {
          this.logger.log(
            `Handling ticket.created event for ticket ID: ${payload.id}`,
          );

          // Dispatch legacy dashboard real-time socket notification
          this.gateway.notifyNewTicket(payload);

          // Find all users with code AGENT or ADMIN
          const recipients = await this.prisma.user.findMany({
            where: {
              userRoles: {
                some: {
                  role: {
                    code: { in: ['AGENT', 'ADMIN'] },
                  },
                },
              },
            },
          });

          this.logger.log(
            `Found ${recipients.length} agent/admin recipients for persistent in-app notifications.`,
          );

          // Save persistent in-app notifications and broadcast live
          for (const recipient of recipients) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const notification = await this.prisma.notification.create({
              data: {
                userId: recipient.id,
                title: `⚡ New Support Ticket Raised: #${payload.id.substring(0, 8)}`,
                message: payload.title,
                type: 'ticket.created',
                ticketId: payload.id,
              },
            });

            this.gateway.emitNotification(recipient.id, notification);
          }

          // Dispatch real email to support agent
          const subject = `⚡ New Support Ticket Raised: #${payload.id.substring(0, 8)}`;
          const html = this.buildTicketCreatedTemplate(payload);

          await this.emailService.sendMail(
            'agent@quickdesk.com',
            subject,
            html,
          );
        } catch (err) {
          this.logger.error('Failed to process ticket.created event', err);
        }
      })();
    });

    // 2. Ticket Resolved Event Listener (Promise Safe)
    this.eventEmitter.on('ticket.resolved', (payload: TicketPayload) => {
      void (async () => {
        try {
          this.logger.log(
            `Handling ticket.resolved event for ticket ID: ${payload.id}`,
          );

          // Dispatch legacy real-time in-app socket notifications
          this.gateway.notifyTicketResolved(payload);

          // Save persistent in-app notification for the employee
          const plainReplyPreview = payload.finalReply
            ? payload.finalReply.replace(/<[^>]*>/g, '').substring(0, 80) +
              '...'
            : 'No reply content';

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const notification = await this.prisma.notification.create({
            data: {
              userId: payload.employeeId,
              title: `✅ Your Support Ticket Has Been Resolved: #${payload.id.substring(0, 8)}`,
              message: `Official response: "${plainReplyPreview}"`,
              type: 'ticket.resolved',
              ticketId: payload.id,
            },
          });

          this.gateway.emitNotification(payload.employeeId, notification);

          // Fetch employee details
          const employeeEmail =
            payload.employee?.email || 'employee@quickdesk.com';
          const employeeName = payload.employee?.name || 'Valued Employee';

          // Dispatch real email to employee
          const subject = `✅ Your Support Ticket Has Been Resolved: #${payload.id.substring(0, 8)}`;
          const html = this.buildTicketResolvedTemplate(payload, employeeName);

          await this.emailService.sendMail(employeeEmail, subject, html);
        } catch (err) {
          this.logger.error('Failed to process ticket.resolved event', err);
        }
      })();
    });
  }

  private buildTicketCreatedTemplate(ticket: TicketPayload): string {
    const category = ticket.agentCategory || ticket.aiCategory || 'Other';
    const priority = ticket.agentPriority || ticket.aiPriority || 'Medium';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="background-color: #4f46e5; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">⚡ New Ticket Raised</h2>
        </div>
        <div style="padding: 20px; color: #1e293b;">
          <h3 style="margin-top: 0; color: #0f172a;">${ticket.title}</h3>
          <p style="color: #64748b; font-size: 14px;"><strong>Raised by:</strong> ${ticket.employee?.name || 'Employee'}</p>
          
          <div style="margin: 15px 0;">
            <span style="background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
              Category: ${category}
            </span>
            <span style="background-color: #fef2f2; color: #991b1b; border: 1px solid #fecdd3; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-left: 8px;">
              Priority: ${priority}
            </span>
          </div>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #cbd5e1; margin-top: 15px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${ticket.description}</p>
          </div>
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="http://localhost:5173/dashboard" style="background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Open Agent Dashboard
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
          QuickDesk Helpdesk Inc. — Auto Triage and Notifications
        </div>
      </div>
    `;
  }

  private buildTicketResolvedTemplate(
    ticket: TicketPayload,
    employeeName: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <div style="background-color: #10b981; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">✅ Ticket Resolved</h2>
        </div>
        <div style="padding: 20px; color: #1e293b;">
          <p>Hello <strong>${employeeName}</strong>,</p>
          <p>Our support team has successfully resolved your ticket:</p>
          
          <h3 style="color: #0f172a; margin-bottom: 5px;">${ticket.title}</h3>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 0;">Ticket ID: #${ticket.id}</p>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #065f46; border-bottom: 1px dashed #a7f3d0; padding-bottom: 8px; margin-bottom: 10px;">Official Response:</h4>
            <div style="font-size: 14px; line-height: 1.6; color: #064e3b;">
              ${ticket.finalReply || ''}
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b;">If you need further assistance or this issue has not been fully resolved, please open a follow-up ticket in the portal.</p>
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="http://localhost:5173/my-tickets" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              View My Tickets
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
          QuickDesk Helpdesk Inc. — Empowering employees through RAG
        </div>
      </div>
    `;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAllForUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async markAsRead(id: string, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async markAllAsRead(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
