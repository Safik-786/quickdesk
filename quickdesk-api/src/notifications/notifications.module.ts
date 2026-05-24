import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SocketsModule } from '../sockets/sockets.module';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [SocketsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
