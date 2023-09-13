import {
  Body,
  Controller,
  Get,
  Delete,
  ParseIntPipe,
  Post,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel, ChannelMember, ChannelMessage } from '@prisma/client';
import { ChannelService } from '../../service/channel/channel.service';
import {
  CreateChannelDto,
  ChannelMembershipDto,
  AdminActionDto,
  ChannelInfoDto,
  ChannelMemberDto,
} from '../../dto/channel.dto';
import { ChannelMemberService } from '../../service/channel-member/channel-member.service';
import { ErrorDto } from 'src/chat/dto/error.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@ApiTags('Channel module')
@Controller('channel')
export class ChannelController {
  constructor(
    private prisma: PrismaService,
    private ChannelService: ChannelService,
    private ChannelMemberService: ChannelMemberService,
  ) {}
  //Get Functions for getting Channels
  @Get('getAllChannels')
  async getAllChannels(): Promise<Channel[]> {
    return await this.prisma.channel.findMany();
  }

  @Get('getAllChannelsFromUser')
  async getAllChannelsFromUser(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('role') role: string,
  ): Promise<ChannelInfoDto[]> {
    return await this.ChannelService.getChannelsforId(userId, role);
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

  @Get('getAllPublicChannels')
  async getAllPublicChannels(): Promise<ChannelInfoDto[]> {
    return await this.ChannelService.getAllPublicChannels();
  }
  @Get('getAllAvaiableChannels')
  async getAllAvaiableChannels(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInfoDto[]> {
    return await this.ChannelService.getAllAvailableChannels(userId);
  }

  @Get('getAllChannelManagerMembers')
  async getAllUsersChannelMembers(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMemberDto[]> {
    return await this.ChannelService.getAllChannelManagerMembers(channelId);
  }

  @Get('isUserBanned')
  async isUserBanned(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<boolean> {
    return await this.ChannelMemberService.isUserBanned(userId, channelId);
  }

 @Get('comparePassword')
 async comparePassword(
	   @Query('channelId', ParseIntPipe) channelId: number,
   @Query('password') password: string,
 ): Promise<boolean | ErrorDto > {
	try{
		return await this.ChannelService.comparePassword(channelId, password);
	} catch (error: any) {
		return { error: error.message as string };
	}
}

  //Post Functions to create Channels
  @Post('createProtectedChannel')
  async createChannel(
    @Body() CreateChannelDto: CreateChannelDto,
  ): Promise< Channel | ErrorDto> {
	try{
		return await this.ChannelService.createProtectedChannel(CreateChannelDto);
	}
	catch (error) {
		return { error: error.message as string };
  }
}


  @Post('createUnProtectedChannel')
  async createUnProtectedChannel(
    @Body() CreateChannelDto: CreateChannelDto,
  ): Promise<Channel | ErrorDto> {
	try{
		return  await this.ChannelService.createUnProtectedChannel(CreateChannelDto);
	} catch (error) {
		return { error: error.message as string };
  }
}

  //Patch Functions to change existing Channel properties
  @Patch('addUserToChannel')
  async addUserToChannel(
    @Body() ChannelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    return await this.ChannelService.addUserToChannel(ChannelMembershipDto);
  }

  @Patch('MakeUserAdmin')
  async MakeUserAdmin(@Body() AdminActionDto: AdminActionDto): Promise<void> {
    await this.ChannelService.makeAdmin(AdminActionDto);
  }

  @Patch('KickUser')
  async KickUser(@Body() AdminActionDto: AdminActionDto): Promise<void> {
    await this.ChannelService.kickChannelMember(AdminActionDto);
  }

  @Patch('updateMutedUsers')
  async updateMutedUsers(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMember[]> {
    return await this.ChannelService.updateMutedUsers(
      channelId,
    );
  }

  @Delete('removeUserFromChannel')
  async removeUserFromChannel(
    @Body() ChannelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
	try{
   return await this.ChannelService.removeUserFromChannel(ChannelMembershipDto);
	} catch (error) {
		throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
	}
  }

  @Delete('destroyChannel')
  async destroyChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<void> {
    await this.ChannelService.destroyChannel(channelId);
  }

}
