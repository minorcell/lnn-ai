import { Controller, Body, Post, Res } from '@nestjs/common';
import { LocalBotService } from './local-bot.service';
import { Response } from 'express';

interface EnhancedResponse extends Response {
  flush?: () => void;
}

@Controller('local-bot')
export class LocalBotController {
  constructor(private readonly localBotService: LocalBotService) {}

  @Post('chat')
  chat(@Body() { message }: { message: string }) {
    return this.localBotService.chat(message);
  }

  @Post('chat-stream')
  async chatStream(
    @Body() { message }: { message: string },
    @Res() response: EnhancedResponse,
  ) {
    await this.localBotService.chatStream(message, response);
  }
}
