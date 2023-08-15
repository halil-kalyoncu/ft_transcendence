import {
	Body,
	Controller,
	Get,
	ParseIntPipe,
	Post,
	Query,
	Patch,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { PrismaService } from '../../../prisma/prisma.service';
  import { Channel } from '@prisma/client';
  import { ChannelService } from '../../service/channel/channel.service';
  import {
	CreateChannelDto,
	ChannelMembershipDto,
	AdminActionDto,
	ChannelInfoDto
  } from 'src/chat/dto/channel.dto';
  
  @ApiTags('Channel module')
  @Controller('channel')
  export class ChannelController {
	constructor(
	  private prisma: PrismaService,
	  private ChannelService: ChannelService,
	) {}
	//Get Functions for getting Channels
	@Get('getAllChannels')
	async getAllChannels(): Promise<Channel[]> {
	  return await this.prisma.channel.findMany();
	}
  
	@Get('getAllChannelsFromUser')
	async getAllChannelsFromUser(
	  @Query('userId', ParseIntPipe) userId: number,
	): Promise<ChannelInfoDto[]> {
	  return await this.ChannelService.getChannelsforId(userId);
	}
  
	@Get('getAllChannelsWhereUserAdmin')
	async getAllChannelsWhereUserAdmin(
	  @Query('userId', ParseIntPipe) userId: number,
	): Promise<ChannelInfoDto[]> {
	  return await this.ChannelService.getChannelsforId(userId, 'admin');
	}
  
	@Get('getAllChannelsWhereUserOwner')
	async getAllChannelsWhereUserOwner(
	  @Query('userId', ParseIntPipe) userId: number,
	): Promise<ChannelInfoDto[]> {
	  return await this.ChannelService.getChannelsforId(userId, 'owner');
	}
  
	@Get('getAllChannelsWhereUserMember')
	async getAllChannelsWhereUserMember(
	  @Query('userId', ParseIntPipe) userId: number,
	): Promise<ChannelInfoDto[]> {
	  return await this.ChannelService.getChannelsforId(userId, 'member');
	}

	@Get ('getAllPublicChannels')
	async getAllPublicChannels(): Promise<ChannelInfoDto[]>{
		return await this.ChannelService.getAllPublicChannels();
	}
  
	//Post Functions to create Channels
	@Post('createProtectedChannel')
	async createChannel(
	  @Body() CreateChannelDto: CreateChannelDto,
	): Promise<void> {
	  await this.ChannelService.createProtectedChannel(CreateChannelDto);
	}
  
	@Post('createUnProtectedChannel')
	async createUnProtectedChannel(
	  @Body() CreateChannelDto: CreateChannelDto,
	): Promise<void> {
	  await this.ChannelService.createUnProtectedChannel(CreateChannelDto);
	}
  
	//Patch Functions to change existing Channel properties
	@Patch('addUserToChannel')
	async addUserToChannel(
	  @Body() ChannelMembershipDto: ChannelMembershipDto,
	): Promise<void> {
	  await this.ChannelService.addUserToChannel(ChannelMembershipDto);
	}
  
	@Patch('removeUserFromChannel')
	async removeUserFromChannel(
	  @Body() ChannelMembershipDto: ChannelMembershipDto,
	): Promise<void> {
	  await this.ChannelService.removeUserFromChannel(ChannelMembershipDto);
	}
  
	@Patch('MakeUserAdmin')
	async MakeUserAdmin(@Body() AdminActionDto: AdminActionDto): Promise<void> {
	  await this.ChannelService.makeAdmin(AdminActionDto);
	}
  
	@Patch('KickUser')
	async KickUser(@Body() AdminActionDto: AdminActionDto): Promise<void> {
	  await this.ChannelService.kickChannelMember(AdminActionDto);
	}
  }
  