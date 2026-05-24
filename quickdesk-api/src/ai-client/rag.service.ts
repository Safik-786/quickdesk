import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

// We import dynamically because transformers.js is ESM/CJS hybrid and might cause issues in some setups
let pipeline: any;

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private isReady = false;
  private extractor: any;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing Postgres pgvector Store...');
      
      // Dynamically import Xenova transformers to avoid module resolution conflicts
      const transformers = await import('@xenova/transformers');
      pipeline = transformers.pipeline;

      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      
      this.isReady = true;
      this.logger.log('pgvector Store successfully initialized and ready for queries.');
    } catch (error) {
      this.logger.error('Failed to initialize RAG Vector Store', error);
    }
  }

  async retrieveRelevantDocs(query: string, k: number = 3): Promise<{ pageContent: string; metadata: { source: string } }[]> {
    if (!this.isReady) {
      return [];
    }
    
    // Embed query
    const queryOutput = await this.extractor(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryOutput.data);

    // Similarity search via pgvector: 1 - (embedding <=> queryVector) is cosine similarity
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT id, content, source, 1 - (embedding <=> ${queryVector}::vector) as similarity
      FROM "KnowledgeChunk"
      ORDER BY embedding <=> ${queryVector}::vector
      LIMIT ${k}
    `;

    return results.map(row => ({
      pageContent: row.content,
      metadata: { source: row.source },
    }));
  }
}
