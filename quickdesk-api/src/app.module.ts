import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuditModule } from './audit/audit.module';
import { MetricsModule } from './metrics/metrics.module';
import { SocketsModule } from './sockets/sockets.module';
import { AiClientModule } from './ai-client/ai-client.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    AuditModule,
    MetricsModule,
    SocketsModule,
    AiClientModule,
    EventsModule,
    NotificationsModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
