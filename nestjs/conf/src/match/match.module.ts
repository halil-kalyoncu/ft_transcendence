import { Module } from '@nestjs/common';
import { MatchService } from './service/match.service';
import { MatchController } from './controller/match.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    MatchService,
  ],
  controllers: [MatchController],
  exports: [MatchService]
})
export class MatchModule {}