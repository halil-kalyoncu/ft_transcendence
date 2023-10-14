import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway/game/game.gateway';
import { UserModule } from '../user/user.module';
import { MatchModule } from '../match/match.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, MatchModule, AuthModule],
  controllers: [],
  providers: [EventsGateway],
})
export class GameModule {}
