import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import { Response } from 'express';

interface OllamaResponse {
  model: string;
  message: {
    content: string;
  };
}

interface EnhancedResponse extends Response {
  flush?: () => void;
}

@Injectable()
export class LocalBotService {
  async chat(message: string) {
    try {
      const prompt = { role: 'user', content: message };
      const response = (await ollama.chat({
        model: 'qwen2.5:14b',
        messages: [prompt],
        stream: false,
      })) as OllamaResponse;

      return {
        data: {
          model: response.model,
          message: response.message.content,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || 'An unexpected error occurred');
    }
  }

  async chatStream(message: string, response: EnhancedResponse) {
    try {
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      const prompt = { role: 'user', content: message };
      const stream = await ollama.chat({
        model: 'qwen2.5:14b',
        messages: [prompt],
        stream: true,
      });

      for await (const part of stream) {
        const chunk = part.message.content;
        response.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        if (response.flush) {
          response.flush();
        }
      }

      response.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      response.end();
    } catch (error: unknown) {
      const err = error as Error;
      response.write(
        `data: ${JSON.stringify({
          error: {
            message: err.message || 'An unexpected error occurred',
            stack:
              process.env.NODE_ENV === 'development' ? err.stack : undefined,
          },
        })}\n\n`,
      );
      response.end();
    }
  }
}
