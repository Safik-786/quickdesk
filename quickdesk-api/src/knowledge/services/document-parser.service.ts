import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class DocumentParserService {
  /**
   * Parses the file buffer and extracts plain text based on its extension.
   * This is an implementation of the Strategy pattern for document ingestion.
   */
  async parseText(buffer: Buffer, extension: string): Promise<string> {
    switch (extension) {
      case '.pdf':
        return this.parsePdf(buffer);
      case '.txt':
      case '.md':
      case '.csv':
        return this.parseTextFile(buffer);
      default:
        throw new UnsupportedMediaTypeException(
          `File type ${extension} is not supported for knowledge base extraction.`,
        );
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      return data.text;
    } catch (error: any) {
      throw new Error(
        `Failed to parse PDF file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  private parseTextFile(buffer: Buffer): string {
    return buffer.toString('utf-8');
  }
}
