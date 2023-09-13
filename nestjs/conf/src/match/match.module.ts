import { Module, forwardRef } from '@nestjs/common';
import { MatchService } from './service/match.service';
import { MatchController } from './controller/match.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PowerupModule } from '../powerup/powerup.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    PowerupModule,
  ],
  providers: [MatchService],
  controllers: [MatchController],
  exports: [MatchService],
})
export class MatchModule {}
