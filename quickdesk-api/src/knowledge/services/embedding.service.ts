import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';
import { Chunk } from './chunking.service';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private embedder: any;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    this.logger.log('Initializing local embedding model...');
    // We use a small, fast local embedding model with 384 dimensions.
    // This perfectly matches the Unsupported("vector(384)") in schema.prisma.
    try {
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
      );
      this.logger.log('Local embedding model initialized.');
    } catch (error) {
      this.logger.error('Failed to initialize local embedding model', error);
    }
  }

  async embedAndStore(chunks: Chunk[], source: string): Promise<void> {
    if (!this.embedder) {
      throw new Error('Embedding model not initialized');
    }

    this.logger.log(
      `Generating embeddings for ${chunks.length} chunks from ${source}`,
    );

    // Process chunks in small batches to avoid memory overflow
    const BATCH_SIZE = 10;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      // Parallel embedding generation for the batch
      const embeddingPromises = batch.map(async (chunk) => {
        // Output from Xenova pipeline is a tensor

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const output: any = await this.embedder(chunk.content, {
          pooling: 'mean',
          normalize: true,
        });
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const vector = Array.from(output.data);
        return {
          content: chunk.content,
          source: chunk.source,
          vector,
        };
      });

      const embeddedBatch = await Promise.all(embeddingPromises);

      // Save to database using Prisma raw query (because of pgvector extension)
      for (const item of embeddedBatch) {
        // pgvector requires string representation of array e.g., '[0.1, 0.2, ...]'
        const vectorString = `[${item.vector.join(',')}]`;

        await this.prisma.$executeRaw`
          INSERT INTO "KnowledgeChunk" (id, content, source, embedding)
          VALUES (
            gen_random_uuid()::text,
            ${item.content},
            ${item.source},
            ${vectorString}::vector
          )
        `;
      }
      this.logger.debug(
        `Upserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} to vector DB.`,
      );
    }

    this.logger.log(`Completed vectorization for ${source}`);
  }
}
