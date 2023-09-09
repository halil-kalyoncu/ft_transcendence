import { Module, forwardRef } from '@nestjs/common';
import { MatchmakingService } from './service/matchmaking.service';
import { MatchmakingController } from './controller/matchmaking.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [MatchmakingService],
  controllers: [MatchmakingController],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
