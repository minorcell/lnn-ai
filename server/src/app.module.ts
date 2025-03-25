import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasicBotModule } from './basic-bot/basic-bot.module';

@Module({
  imports: [BasicBotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
