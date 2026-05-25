import { Injectable, Logger } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface Chunk {
  content: string;
  source: string;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  /**
   * Semantically chunks text into pieces small enough for embedding models
   * while maintaining context overlap.
   */
  async chunkText(text: string, source: string): Promise<Chunk[]> {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text]);

      return docs.map((doc) => ({
        content: doc.pageContent,
        source,
      }));
    } catch (error: any) {
      this.logger.error(`Error chunking text for source ${source}:`, error);

      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to chunk document: ${error?.message || 'Unknown error'}`,
      );
    }
  }
}
