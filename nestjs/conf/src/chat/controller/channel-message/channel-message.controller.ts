import { Controller, Query, Get, Patch, ParseIntPipe} from '@nestjs/common';
import { ChannelMessage, ChannelMessageReadStatus } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import {ChannelMessageDto} from '../../dto/channel.dto';
import { ChannelMessageService } from '../../service/channel-message/channel-message.service';
@ApiTags('Channel-Message module')
@Controller('channel-message')
export class ChannelMessageController {
	constructor(
		private ChannelMessageService: ChannelMessageService
	){}

	@Get('getChannelMessagesforChannel')
	async getChannelMessagesforChannel(@Query('channelId', ParseIntPipe) channelId: number): Promise<{}> {
		return await this.ChannelMessageService.getChannelMessagesforChannel(channelId);
	}


	@Patch('markChannelMessagesAsRead')
	async markChannelMessagesAsRead(@Query('channelId', ParseIntPipe) channelId: number,
	@Query('userId', ParseIntPipe) userId: number): Promise<ChannelMessageDto[]> {
		return await this.ChannelMessageService.markChannelMessagesAsRead(channelId, userId);
	}
}
