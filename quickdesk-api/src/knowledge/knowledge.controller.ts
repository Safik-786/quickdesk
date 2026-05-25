import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './services/knowledge.service';
import { Express } from 'express';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Process file asynchronously in background (do not await to avoid blocking response for large files)
    this.knowledgeService.processDocument(file).catch((err) => {
      console.error(`Failed to process document ${file.originalname}:`, err);
    });

    return {
      message: 'File upload started. Processing asynchronously.',
      filename: file.originalname,
      size: file.size,
    };
  }
}
