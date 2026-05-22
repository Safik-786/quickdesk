import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiClientModule } from '../ai-client/ai-client.module';
import { AuditModule } from '../audit/audit.module';
import { SocketsModule } from '../sockets/sockets.module';

@Module({
  imports: [PrismaModule, AiClientModule, AuditModule, SocketsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
