import { Injectable, Logger } from '@nestjs/common';
import { DocumentParserService } from './document-parser.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { Express } from 'express';
import { extname } from 'path';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly parser: DocumentParserService,
    private readonly chunker: ChunkingService,
    private readonly embedder: EmbeddingService,
  ) {}

  async processDocument(file: Express.Multer.File): Promise<void> {
    const extension = extname(file.originalname).toLowerCase();
    this.logger.log(
      `Starting to process document: ${file.originalname} (${extension})`,
    );

    try {
      // 1. Parse text from the file based on extension
      const text = await this.parser.parseText(file.buffer, extension);
      if (!text || text.trim().length === 0) {
        this.logger.warn(`No extractable text found in ${file.originalname}`);
        return;
      }
      this.logger.log(
        `Successfully extracted ${text.length} characters from ${file.originalname}`,
      );

      // 2. Chunk the text
      const chunks = await this.chunker.chunkText(text, file.originalname);
      this.logger.log(`Split document into ${chunks.length} semantic chunks.`);

      // 3. Generate embeddings & Upsert to vector DB
      await this.embedder.embedAndStore(chunks, file.originalname);
      this.logger.log(
        `Finished processing and vectorizing ${file.originalname}`,
      );
    } catch (error: any) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error processing document ${file.originalname}: ${error?.message || 'Unknown Error'}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error?.stack,
      );
      throw error;
    }
  }
}
