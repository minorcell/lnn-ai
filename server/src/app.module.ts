import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasicBotModule } from './basic-bot/basic-bot.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BasicBotModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
