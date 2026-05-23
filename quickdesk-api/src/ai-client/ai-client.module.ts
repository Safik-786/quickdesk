import { Module } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { RagService } from './rag.service';

@Module({
  providers: [AiClientService, RagService],
  exports: [AiClientService],
})
export class AiClientModule {}
