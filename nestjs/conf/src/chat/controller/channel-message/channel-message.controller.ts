import { Controller, Query, Get, ParseIntPipe} from '@nestjs/common';
import { ChannelMessage } from '@prisma/client';
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
}
