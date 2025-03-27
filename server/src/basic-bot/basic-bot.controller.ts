import { Body, Controller, Post } from '@nestjs/common';
import { BasicBotService } from './basic-bot.service';
import { ChatRequestDto } from './dto/chat.dto';

@Controller('basic-bot')
export class BasicBotController {
  constructor(private readonly basicBotServer: BasicBotService) {}

  @Post('chat')
  getHello(@Body() { message }: ChatRequestDto) {
    return this.basicBotServer.chat(message);
  }
}
