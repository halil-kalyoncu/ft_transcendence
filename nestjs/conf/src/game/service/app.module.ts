import { Module } from '@nestjs/common';
import { EventsGateway } from '../gateway/events/events.gateway';
import { GameService } from './game.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
		EventsGateway,
		GameService
	],
})
export class AppModule {}
