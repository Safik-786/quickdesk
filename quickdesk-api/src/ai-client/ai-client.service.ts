import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { RagService } from './rag.service';

interface ClassifyInput {
  title: string;
  description: string;
}

interface ClassifyResult {
  category: string;
  priority: string;
  confidence: number;
}

interface ConversationMessage {
  sender: string;
  message: string;
  timestamp: string;
}

interface DraftReplyInput {
  title: string;
  description: string;
  conversationHistory?: ConversationMessage[];
}

export interface DraftReplyResult {
  draft: string;
  citations: string[];
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private llm: ChatGoogleGenerativeAI;

  constructor(private readonly ragService: RagService) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-flash-latest',
      temperature: 0.2,
    });
  }

  async classify(input: ClassifyInput): Promise<ClassifyResult> {
    try {
      const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          category: z
            .enum(['IT', 'HR', 'Finance', 'Admin', 'Other'])
            .describe('The department category'),
          priority: z
            .enum(['Low', 'Medium', 'High'])
            .describe('The priority level of the ticket'),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe(
              'Your confidence score between 0.0 and 1.0 for how certain you are about the category and priority classification',
            ),
        }),
      );

      const prompt = PromptTemplate.fromTemplate(`
You are a helpdesk ticket classifier. Classify the following ticket into exactly one category and priority.

Ticket Title: {title}
Ticket Description: {description}

{format_instructions}
      `);

      const chain = prompt.pipe(this.llm).pipe(parser);
      const result = await chain.invoke({
        title: input.title,
        description: input.description,
        format_instructions: parser.getFormatInstructions(),
      });

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('AI classify failed, using fallback', message);
      return { category: 'Other', priority: 'Medium', confidence: 0.5 };
    }
  }

  async draftReply(input: DraftReplyInput): Promise<DraftReplyResult> {
    try {
      const query = `${input.title}\n${input.description}`;
      const relevantDocs = await this.ragService.retrieveRelevantDocs(query);

      const citations: string[] = [];
      let context = '';

      if (relevantDocs.length === 0) {
        return {
          draft:
            "I don't have specific guidance for this issue in our knowledge base. A support agent will review your ticket and respond shortly.",
          citations: [],
        };
      }

      for (const doc of relevantDocs) {
        const source = doc.metadata.source || 'Unknown Source';
        if (!citations.includes(source)) {
          citations.push(source);
        }
        context += `\n[Source: ${source}]\n${doc.pageContent}\n`;
      }

      // Build conversation history section
      let conversationSection = '';
      if (input.conversationHistory && input.conversationHistory.length > 0) {
        conversationSection = `\n---\nConversation History (oldest to newest):\n`;
        for (const msg of input.conversationHistory) {
          conversationSection += `[${msg.sender} at ${msg.timestamp}]: ${msg.message}\n`;
        }
        conversationSection += `\n---\nIMPORTANT: The above conversation has already taken place. Your new draft reply MUST continue the conversation naturally. Do NOT repeat information or suggestions already given. Address any new questions or follow-ups from the employee. If the issue seems unresolved, suggest the next logical troubleshooting step.\n`;
      }

      const prompt = PromptTemplate.fromTemplate(`
You are a helpful IT support agent at a company. Use the following knowledge base articles to draft a professional reply to the employee's support ticket.

IMPORTANT RULES:
- Base your reply ONLY on the provided knowledge base articles.
- Do not make up information not present in the articles.
- Be concise, friendly, and actionable.
{conversationHistory}

Knowledge Base Articles:
{context}

---
Employee Ticket:
Title: {title}
Description: {description}

Draft Reply:
      `);

      const chain = prompt.pipe(this.llm);
      const response = await chain.invoke({
        context,
        title: input.title,
        description: input.description,
        conversationHistory: conversationSection,
      });

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        draft: (response as any).content.toString().trim(),
        citations,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('AI draft-reply failed', message);
      throw new ServiceUnavailableException(
        'AI service is currently unavailable',
      );
    }
  }
}
