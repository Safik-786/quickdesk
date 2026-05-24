import { Module, Global } from '@nestjs/common';
import { AppEventEmitter } from './events.service';

@Global()
@Module({
  providers: [AppEventEmitter],
  exports: [AppEventEmitter],
})
export class EventsModule {}
