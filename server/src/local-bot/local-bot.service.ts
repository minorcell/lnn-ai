import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

interface OllamaResponse {
  model: string;
  message: {
    content: string;
  };
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
        code: 200,
        timestamp: new Date().toISOString(),
        data: {
          model: response.model,
          message: response.message.content,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        code: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: err.message || 'An unexpected error occurred',
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
      };
    }
  }

  async chatStream(message: string) {
    try {
      const prompt = { role: 'user', content: message };
      const response = await ollama.chat({
        model: 'qwen2.5:14b',
        messages: [prompt],
        stream: true,
      });

      for await (const part of response) {
        process.stdout.write(part.message.content);
      }
    } catch (error: unknown) {
      const err = error as Error;
      return {
        code: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: err.message || 'An unexpected error occurred',
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
      };
    }
  }
}
