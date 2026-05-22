import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ClassifyInput {
  title: string;
  description: string;
}

interface ClassifyResult {
  category: string;
  priority: string;
}

interface DraftReplyInput {
  title: string;
  description: string;
}

interface DraftReplyResult {
  draft: string;
  citations: string[];
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);

  constructor(private readonly http: HttpService) {}

  async classify(input: ClassifyInput): Promise<ClassifyResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ClassifyResult>('/classify', input),
      );
      return response.data;
    } catch (error) {
      this.logger.error('AI classify failed, using fallback', error?.message);
      // Graceful fallback — ticket still gets created
      return { category: 'Other', priority: 'Medium' };
    }
  }

  async draftReply(input: DraftReplyInput): Promise<DraftReplyResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<DraftReplyResult>('/draft-reply', input),
      );
      return response.data;
    } catch (error) {
      this.logger.error('AI draft-reply failed', error?.message);
      throw new ServiceUnavailableException('AI service is currently unavailable');
    }
  }
}
