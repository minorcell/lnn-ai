import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicBotService {
  async chat(message: string) {
    const body = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个天气查询助手，你会根据用户的问题，比如问题里面的城市，去查询当天这个城市的天气情况，你会对结果进行语义话优化。' },
          { role: 'user', content: message },
        ],
      }),
    };

    try {
      const response = await fetch(
        'https://api.openai-proxy.org/v1/chat/completions',
        body,
      );

      if (!response.ok) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = await response.json();

      return {
        code: 200,
        data: {
          message: data.choices[0].message.content,
          id: data.id,
          model: data.model,
          usage: data.usage,
        },
      };
    } catch (error) {
      return {
        code: 500,
        error: error.message,
      };
    }
  }
}
