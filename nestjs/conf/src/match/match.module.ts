import { Module, forwardRef } from '@nestjs/common';
import { MatchService } from './service/match.service';
import { MatchController } from './controller/match.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PowerupModule } from '../powerup/powerup.module';
import { AchievementModule } from '../achievement/achievement.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    PowerupModule,
    AchievementModule,
  ],
  providers: [MatchService],
  controllers: [MatchController],
  exports: [MatchService],
})
export class MatchModule {}
