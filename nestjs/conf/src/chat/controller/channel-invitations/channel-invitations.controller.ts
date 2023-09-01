import { Controller, Query, Get, Delete, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { ChannelInvitation } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ChannelInvitationsService } from '../../service/channel-invitations/channel-invitations.service';

@ApiTags('Channel-Invitations module')
@Controller('channel-invitations')
export class ChannelInvitationsController {
	constructor(
		private channelInvitationsService: ChannelInvitationsService
	) { }

	@Post('InviteUserToChannel')
	async InviteUserToChannel(
		@Query('channelId', ParseIntPipe) channelId: number,
		@Query('inviteeId', ParseIntPipe) inviteeId: number,
		@Query('inviterId', ParseIntPipe) inviterId: number
	): Promise<ChannelInvitation> {
		return this.channelInvitationsService.inviteUserToChannel(channelId, inviteeId, inviterId );
	}
	
	@Patch('RejectInvitation')
	async RejectInvitation(
		@Query('channelId', ParseIntPipe) channelId: number,
		@Query('userId', ParseIntPipe) userId: number
	): Promise<ChannelInvitation> {
		return this.channelInvitationsService.rejectInvitation(channelId, userId);
	}

	@Delete('AcceptInvitation')
	async AcceptInvitation(
		@Query('channelId', ParseIntPipe) channelId: number,
		@Query('userId', ParseIntPipe) userId: number
	): Promise<ChannelInvitation> {
		return this.channelInvitationsService.acceptInvitation(channelId, userId);
	}
}
