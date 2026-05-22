import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiClientService } from './ai-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        timeout: 30000,
      }),
    }),
  ],
  providers: [AiClientService],
  exports: [AiClientService],
})
export class AiClientModule {}
