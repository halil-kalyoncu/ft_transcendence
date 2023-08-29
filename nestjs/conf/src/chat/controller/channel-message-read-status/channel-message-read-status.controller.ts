import { Controller, Query, Get, Patch, ParseIntPipe } from '@nestjs/common';
import { ChannelMessage, ChannelMessageReadStatus } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ChannelMessageReadStatusService } from '../../service/channel-message-read-status/channel-message-read-status.service';

@ApiTags('Channel-Message-Read-Status module')
@Controller('channel-message-read-status')
export class ChannelMessageReadStatusController {
	constructor(
		private ChannelMessageReadStatusService: ChannelMessageReadStatusService
	) {}

	@Get('getUnreadStatus')
	async getUnreadStatus(
		@Query('channelId', ParseIntPipe) channelId: number,
		@Query('userId', ParseIntPipe) userId: number): Promise<ChannelMessageReadStatus[]> {
		return await this.ChannelMessageReadStatusService.getUnreadStatus(channelId, userId);
	}

}
