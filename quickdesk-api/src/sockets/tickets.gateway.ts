import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Ticket } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class TicketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TicketsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Client joins a room based on their role or userId
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { role: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Join user's private notification room
    void client.join(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} joined private room user:${data.userId}`);

    // 2. Join role-specific rooms
    const roleLower = data.role?.toLowerCase();
    if (roleLower === 'agent' || roleLower === 'admin') {
      void client.join('agents');
      this.logger.log(`Agent/Admin ${data.userId} joined agents room`);
    } else {
      void client.join(`employee:${data.userId}`);
      this.logger.log(`Employee ${data.userId} joined their room`);
    }
  }

  // Send persistent notification to a specific user's private room
  emitNotification(userId: string, notification: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.server.to(`user:${userId}`).emit('notification:received', notification);
  }

  // Called by TicketsService when a new ticket is created
  notifyNewTicket(ticket: Ticket) {
    this.server.to('agents').emit('ticket:created', ticket);
  }

  // Called by TicketsService when a ticket is resolved
  notifyTicketResolved(ticket: Ticket) {
    this.server
      .to(`employee:${ticket.employeeId}`)
      .emit('ticket:resolved', ticket);
    this.server.to('agents').emit('ticket:resolved', ticket);
  }
}
