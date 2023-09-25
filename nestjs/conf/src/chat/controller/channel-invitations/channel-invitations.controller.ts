import {
  Controller,
  Query,
  Get,
  Delete,
  Patch,
  Post,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  ConsoleLogger,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ChannelInvitation } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelInvitationsService } from '../../service/channel-invitations/channel-invitations.service';
import { UserService } from '../../../user/service/user-service/user.service';
import type { ChannelInvitationDto } from '../../dto/channelInvitation.dto';
import { User } from '@prisma/client';
import type { ErrorDto } from '../../dto/error.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';


@ApiTags('Channel-Invitations module')
@Controller('channel-invitations')
export class ChannelInvitationsController {
  constructor(
    private channelInvitationsService: ChannelInvitationsService,
    private userService: UserService,
  ) {}


  @Get('GetPendingInvitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async GetInvitations(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitationDto[]> {
	try{
		return await this.channelInvitationsService.getPendingInvitations(userId);
	} catch (error) {
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
  @Post('InviteUserToChannel')
  async InviteUserToChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('inviteeId', ParseIntPipe) inviteeId: number,
    @Query('inviterId', ParseIntPipe) inviterId: number,
  ): Promise<ChannelInvitation> {
	try{
		return this.channelInvitationsService.inviteUserToChannel(
		  channelId,
		  inviteeId,
		  inviterId,
		);
	} catch(error) {
		if (error instanceof NotFoundException || error instanceof BadRequestException) {
			throw error;
		}
		else {
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
  }

  //ERROR HANDLING API BACKEND
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('InviteUserNameToChannel')
  async InviteUserNameToChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('inviteeName') inviteeName: string,
    @Query('inviterId', ParseIntPipe) inviterId: number,
  ): Promise<ChannelInvitation> {
    try {
      const user = await this.userService.findByUsername(inviteeName);
      if (!user) {
        throw new Error('User not found');
      }
      const inviteeId = user.id;
      return await this.channelInvitationsService.inviteUserToChannel(
        channelId,
        inviteeId,
        inviterId,
      );
    } catch(error) {
		if (error instanceof NotFoundException || error instanceof BadRequestException) {
			throw error;
		}
		else {
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('RejectInvitation')
  async RejectInvitation(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitation> {
    return this.channelInvitationsService.rejectInvitation(channelId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('AcceptInvitation')
  async AcceptInvitation(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitation> {
    return this.channelInvitationsService.acceptInvitation(channelId, userId);
  }
}
