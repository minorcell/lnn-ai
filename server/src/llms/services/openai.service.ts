import { Injectable } from '@nestjs/common';
import {
  EnhancedResponse,
  LLMService,
  OpenAIResponse,
  OpenAIStreamResponse,
} from '../interfaces/llm.interface';

@Injectable()
export class OpenAIService implements LLMService {
  async chat(message: string, stream = false, response?: EnhancedResponse) {
    if (stream && response) {
      return this.chatStream(message, response);
    }

    return this.chatNormal(message);
  }

  private async chatNormal(message: string) {
    const body = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              '你是一个天气查询助手，你会根据用户的问题，比如问题里面的城市，去查询当天这个城市的天气情况，你会对结果进行语义话优化。',
          },
          { role: 'user', content: message },
        ],
      }),
    };

    try {
      const response = await fetch(`${process.env.OPENAI_API_URL}`, body);

      if (!response.ok) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = (await response.json()) as OpenAIResponse;

      return {
        data: {
          message: data.choices[0].message.content,
          id: data.id,
          model: data.model,
          usage: data.usage,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message);
    }
  }

  private async chatStream(message: string, response: EnhancedResponse) {
    try {
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      const body = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                '你是一个天气查询助手，你会根据用户的问题，比如问题里面的城市，去查询当天这个城市的天气情况，你会对结果进行语义话优化。',
            },
            { role: 'user', content: message },
          ],
          stream: true,
        }),
      };

      const fetchResponse = await fetch(`${process.env.OPENAI_API_URL}`, body);

      if (!fetchResponse.ok) {
        throw new Error(`请求失败，状态码：${fetchResponse.status}`);
      }

      if (!fetchResponse.body) {
        throw new Error('响应体为空');
      }

      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsedData = JSON.parse(data) as OpenAIStreamResponse;

              if (
                parsedData.choices &&
                parsedData.choices[0]?.delta &&
                parsedData.choices[0].delta.content
              ) {
                const content = parsedData.choices[0].delta.content;
                response.write(`data: ${JSON.stringify({ content })}\n\n`);
                if (response.flush) {
                  response.flush();
                }
              }
            } catch (e) {
              console.error('解析数据失败:', e);
            }
          }
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
