import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

// We import dynamically because transformers.js is ESM/CJS hybrid and might cause issues in some setups
let pipeline: any;

interface Chunk {
  text: string;
  source: string;
  vector?: number[];
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private chunks: Chunk[] = [];
  private isReady = false;
  private extractor: any;

  async onModuleInit() {
    try {
      this.logger.log('Initializing Native RAG Vector Store...');
      
      // Dynamically import Xenova transformers to avoid module resolution conflicts
      const transformers = await import('@xenova/transformers');
      pipeline = transformers.pipeline;

      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      
      const kbDir = path.join(process.cwd(), '..', 'quickdesk-ai', 'kb');
      
      if (!fs.existsSync(kbDir)) {
        this.logger.warn(`Knowledge base directory not found at ${kbDir}`);
        return;
      }

      const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.md'));
      
      if (files.length === 0) {
        this.logger.warn('No Markdown articles found in the KB directory.');
        return;
      }

      for (const file of files) {
        const filePath = path.join(kbDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Simple chunking by paragraphs
        const paragraphs = content.split(/\n\s*\n/);
        for (const p of paragraphs) {
          const text = p.trim();
          if (text.length > 20) {
            this.chunks.push({
              text,
              source: file,
            });
          }
        }
      }

      this.logger.log(`Loaded ${files.length} articles, split into ${this.chunks.length} chunks. Generating embeddings...`);

      // Embed chunks
      for (const chunk of this.chunks) {
        const output = await this.extractor(chunk.text, { pooling: 'mean', normalize: true });
        chunk.vector = Array.from(output.data);
      }
      
      this.isReady = true;
      this.logger.log('Native Vector Store successfully initialized and ready for queries.');
    } catch (error) {
      this.logger.error('Failed to initialize RAG Vector Store', error);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async retrieveRelevantDocs(query: string, k: number = 3): Promise<{ pageContent: string; metadata: { source: string } }[]> {
    if (!this.isReady || this.chunks.length === 0) {
      return [];
    }
    
    // Embed query
    const queryOutput = await this.extractor(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryOutput.data) as number[];

    // Calculate similarities
    const scoredChunks = this.chunks.map(chunk => ({
      ...chunk,
      score: this.cosineSimilarity(queryVector, chunk.vector!),
    }));

    // Sort by score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return top K
    return scoredChunks.slice(0, k).map(chunk => ({
      pageContent: chunk.text,
      metadata: { source: chunk.source },
    }));
  }
}
