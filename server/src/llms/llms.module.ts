import { Module } from '@nestjs/common';
import { LLMsController } from './llms.controller';
import { OpenAIService } from './services/openai.service';
import { OllamaService } from './services/ollama.service';

@Module({
  controllers: [LLMsController],
  providers: [OpenAIService, OllamaService],
})
export class LLMsModule {}
