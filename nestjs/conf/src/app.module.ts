import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { GameService } from './game/service/game.service';
import { EventsGateway } from './game/gateway/events/events.gateway';
import { MatchModule } from './match/match.module';
import { ChannelMessageReadStatusService } from './service/channel-message-read-status/channel-message-read-status.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    ChatModule,
    AuthModule,
    PrismaModule,
    MatchModule,
  ],
  providers: [
	EventsGateway,
	GameService,
	ChannelMessageReadStatusService,
  ],
})
export class AppModule {}
