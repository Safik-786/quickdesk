import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './services/knowledge.service';
import { DocumentParserService } from './services/document-parser.service';
import { ChunkingService } from './services/chunking.service';
import { EmbeddingService } from './services/embedding.service';

@Module({
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    DocumentParserService,
    ChunkingService,
    EmbeddingService,
  ],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
