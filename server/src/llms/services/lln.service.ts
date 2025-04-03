import { Ollama } from '@langchain/community/llms/ollama';
import { Injectable } from '@nestjs/common';
import { EnhancedResponse, LLMService } from '../interfaces/llm.interface';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import {
  ollamaConfig,
  systemPrompt,
  createMessageTemplate,
} from '../config/lln.config';

@Injectable()
export class LLNService implements LLMService {
  async chat(message: string, stream = false, response?: EnhancedResponse) {
    if (stream && response) {
      return this.chatStream(message, response);
    }

    return this.chatNormal(message);
  }

  private async chatNormal(message: string) {
    const ollama = new Ollama(ollamaConfig);

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(createMessageTemplate(message)),
    ]);

    const chain = prompt.pipe(ollama);

    try {
      const stream = await chain.stream(message);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
      }

      return {
        data: {
          message: fullResponse,
        },
      };
    } catch (error) {
      console.error('Error in LLNService chat method:', error);
      throw new Error('fetch failed');
    }
  }

  private async chatStream(message: string, response: EnhancedResponse) {
    try {
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      const ollama = new Ollama(ollamaConfig);

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemPrompt),
        HumanMessagePromptTemplate.fromTemplate(createMessageTemplate(message)),
      ]);
      const chain = prompt.pipe(ollama);

      const stream = await chain.stream(message);

      for await (const chunk of stream) {
        const data = JSON.stringify({ data: { message: chunk } });
        response.write(`data: ${data}\n\n`);
      }

      response.write('data: [DONE]\n\n');
      response.end();
    } catch (error) {
      console.error('Error in LLNService chatStream method:', error);
      throw new Error('fetch failed');
    }
  }
}
