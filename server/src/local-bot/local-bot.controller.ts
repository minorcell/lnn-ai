import { Controller, Body, Post } from '@nestjs/common';
import { LocalBotService } from './local-bot.service';

@Controller('local-bot')
export class LocalBotController {
    constructor(private readonly localBotService: LocalBotService) { }

    @Post('chat')
    chat(@Body() { message }) {
        return this.localBotService.chat(message);
    }
}
