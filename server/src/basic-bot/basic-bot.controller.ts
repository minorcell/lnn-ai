import { Body, Controller, Post } from '@nestjs/common';
import { BasicBotService } from './basic-bot.service';

@Controller('basic-bot')
export class BasicBotController {
  constructor(private readonly basicBotServer: BasicBotService) {}

  @Post('chat')
  getHello(@Body() { message }: { message: string }) {
    return this.basicBotServer.chat(message);
  }
}
