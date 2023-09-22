import { Controller, Query, Get, Patch, ParseIntPipe, NotFoundException,  HttpException,
	HttpStatus,   UseGuards, } from '@nestjs/common';
import {
  ChannelMessage,
  ChannelMessageReadStatus,
  ChannelMember,
} from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelMessageDto } from '../../dto/channel.dto';
import { ChannelMessageService } from '../../service/channel-message/channel-message.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';


@ApiTags('Channel-Message module')
@Controller('channel-message')
export class ChannelMessageController {
  constructor(private ChannelMessageService: ChannelMessageService) {}
  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('getChannelMessagesforChannel')
  async getChannelMessagesforChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelMessageDto[]> {
	try{
		return await this.ChannelMessageService.getChannelMessagesforChannel(
		  channelId,
		  userId,
		);
	} catch(error) {
		if (error instanceof NotFoundException) {
			throw error;
		}
		else {
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
  }
}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('markChannelMessagesAsRead')
  async markChannelMessagesAsRead(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelMessageDto[]> {
	try{
		return await this.ChannelMessageService.markChannelMessagesAsRead(
		  channelId,
		  userId,
		);
	} catch(error) {
		if (error instanceof NotFoundException) {
			throw error;
		}
		else {
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
}
