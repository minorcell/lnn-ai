import { Module } from '@nestjs/common';
import { LocalBotController } from './local-bot.controller';
import { LocalBotService } from './local-bot.service';

@Module({
  controllers: [LocalBotController],
  providers: [LocalBotService]
})
export class LocalBotModule {}
