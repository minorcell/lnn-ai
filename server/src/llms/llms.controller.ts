import { Body, Controller, Post, Res } from '@nestjs/common';
import { OpenAIService } from './services/openai.service';
import { OllamaService } from './services/ollama.service';
import { LLNService } from './services/lln.service';
import { ChatRequestDto, ModelType } from './dto/chat.dto';
import { EnhancedResponse } from './interfaces/llm.interface';

@Controller('llms')
export class LLMsController {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly ollamaService: OllamaService,
    private readonly llnService: LLNService,
  ) {}

  @Post('chat')
  async chat(
    @Body() chatRequest: ChatRequestDto,
    @Res() response: EnhancedResponse,
  ) {
    try {
      const message = chatRequest.message.trim();
      let modelType: ModelType;
      if (chatRequest.modelType === ModelType.OLLAMA) {
        modelType = ModelType.OLLAMA;
      } else {
        modelType = ModelType.OPENAI;
      }
      const stream = Boolean(chatRequest.stream);
      const service =
        modelType === ModelType.OPENAI
          ? this.openaiService
          : this.ollamaService;
      if (stream) {
        return service.chat(message, true, response);
      }

      const result = await service.chat(message, false);
      return response.json(result);
    } catch (error) {
      console.error('处理请求时出错:', error);
      return response.status(500).json({
        code: 500,
        error: {
          message: '服务器内部错误',
          details: (error as Error).message,
        },
      });
    }
  }

  @Post('lln-chat')
  async llnChat(
    @Body() { message, stream }: { message: string; stream: boolean },
    @Res() response: EnhancedResponse,
  ) {
    return await this.llnService.chat(message, stream, response);
  }
}
