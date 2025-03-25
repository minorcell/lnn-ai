import { Module } from '@nestjs/common';
import { BasicBotController } from './basic-bot.controller';
import { BasicBotService } from './basic-bot.service';

@Module({
  controllers: [BasicBotController],
  providers: [BasicBotService],
})
export class BasicBotModule {}
