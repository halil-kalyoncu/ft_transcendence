import { Module } from '@nestjs/common';
import { PowerupService } from './service/powerup.service';

@Module({
  providers: [PowerupService],
  exports: [PowerupService]
})
export class PowerupModule {}
