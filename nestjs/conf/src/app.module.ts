import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MatchModule } from './match/match.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { PowerupModule } from './powerup/powerup.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    ChatModule,
    AuthModule,
    PrismaModule,
    MatchModule,
    MatchmakingModule,
    PowerupModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
