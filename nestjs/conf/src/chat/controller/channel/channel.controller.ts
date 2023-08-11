import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel } from '@prisma/client';
import { ChannelService } from '../../service/channel/channel.service';
import { CreateChannelDto } from 'src/chat/dto/channel.dto';


@ApiTags('Channel module')
@Controller('channel')
export class ChannelController {
	constructor(   
	private prisma: PrismaService,
	private ChannelService: ChannelService)
	{}
	//Get Functions for getting Channels
	@Get("getAllChannels")
	async getAllChannels(): Promise<Channel[]> {
		return await this.prisma.channel.findMany();
	}

	@Get("getAllChannelsFromUser")
	async getAllChannelsFromUser(@Query('userId', ParseIntPipe) userId: number): Promise<Channel[]> {
		return await this.ChannelService.getChannelsforId(userId);
	}

	@Get("getAllChannelsWhereUserAdmin")
	async getAllChannelsWhereUserAdmin(@Query('userId', ParseIntPipe) userId: number): Promise<Channel[]> {
		return await this.ChannelService.getChannelsforId(userId,"admin");
	}

	@Get("getAllChannelsWhereUserOwner")
	async getAllChannelsWhereUserOwner(@Query('userId', ParseIntPipe) userId: number): Promise<Channel[]> {
		return await this.ChannelService.getChannelsforId(userId,"owner");
	}

	@Get("getAllChannelsWhereUserMember")
	async getAllChannelsWhereUserMember(@Query('userId', ParseIntPipe) userId: number): Promise<Channel[]> {
		return await this.ChannelService.getChannelsforId(userId,"member");
	}


	//Post Functions to create Channels
	@Post("createProtectedChannel")
	async createChannel(@Body() CreateChannelDto: CreateChannelDto ): Promise<void> {
		await this.ChannelService.createProtectedChannel(CreateChannelDto)
	}

	@Post("createUnProtectedChannel")
	async createUnProtectedChannel(@Body() CreateChannelDto: CreateChannelDto): Promise<void> {
		await this.ChannelService.createUnProtectedChannel(CreateChannelDto)
	}
}