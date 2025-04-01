import { Module } from '@nestjs/common';
import { LLMsController } from './llms.controller';
import { OpenAIService } from './services/openai.service';
import { OllamaService } from './services/ollama.service';
import { LLNService } from './services/lln.service';

@Module({
  controllers: [LLMsController],
  providers: [OpenAIService, OllamaService, LLNService],
})
export class LLMsModule {}
