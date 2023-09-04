import { Module } from '@nestjs/common';
import { MatchmakingService } from './service/matchmaking.service';
import { MatchmakingController } from './controller/matchmaking.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MatchmakingService],
  controllers: [MatchmakingController]
})
export class MatchmakingModule {}
