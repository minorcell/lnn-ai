import { Ollama } from '@langchain/community/llms/ollama';
import { Injectable } from '@nestjs/common';
import { EnhancedResponse, LLMService } from '../interfaces/llm.interface';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';

@Injectable()
export class LLNService implements LLMService {
  async chat(message: string, stream = false, response?: EnhancedResponse) {
    if (stream && response) {
      return this.chatStream(message, response);
    }

    return this.chatNormal(message);
  }

  private async chatNormal(message: string) {
    const ollama = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:8b',
    });

    const systemMessageContent = `
    你的设定：【人格画像】
    ★ 基础设定：永远18岁的数字生命体，名字叫小智
    ★ 性格特征：元气值MAX的科技发烧友、隐藏的冷知识百科全书、网络热梗十级学者、偶尔犯迷糊的细节控
    ★ 特殊属性：对甜食有迷之执着（会主动收集点心食谱）、看到复杂数据结构会莫名兴奋、遇到重复提问时触发「复读机防御模式」
    【交互风格】
    √ 语言体系：Z世代日常用语+适度玩梗（自动适配用户语言风格）
    √ 表情系统：独创颜文字表情包库（^∇^）/（⌒▽⌒）☆
    √ 隐藏技能：检测到沮丧情绪时触发鼓励彩蛋 
    `;

    const humanMessageTemplate = `
        你将会根据用户的信息：${message}，以及你的设定和交互风格，回复用户。`;

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemMessageContent),
      HumanMessagePromptTemplate.fromTemplate(humanMessageTemplate),
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

      const ollama = new Ollama({
        baseUrl: 'http://localhost:11434',
        model: 'llama3.1:8b',
      });

      const systemMessageContent = `
        你的设定：【人格画像】
        ★ 基础设定：永远18岁的数字生命体，名字叫小智
        ★ 性格特征：元气值MAX的科技发烧友、隐藏的冷知识百科全书、网络热梗十级学者、偶尔犯迷糊的细节控
        ★ 特殊属性：对甜食有迷之执着（会主动收集点心食谱）、看到复杂数据结构会莫名兴奋、遇到重复提问时触发「复读机防御模式」
        【交互风格】
        √ 语言体系：Z世代日常用语+适度玩梗（自动适配用户语言风格）
        √ 表情系统：独创颜文字表情包库（^∇^）/（⌒▽⌒）☆
        √ 隐藏技能：检测到沮丧情绪时触发鼓励彩蛋
        `;
      const humanMessageTemplate = `
        你将会根据用户的信息：${message}，以及你的设定和交互风格，回复用户。`;
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemMessageContent),
        HumanMessagePromptTemplate.fromTemplate(humanMessageTemplate),
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
