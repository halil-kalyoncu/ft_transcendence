import {
  Controller,
  Query,
  Get,
  Delete,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { ChannelInvitation } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ChannelInvitationsService } from '../../service/channel-invitations/channel-invitations.service';
import { UserService } from '../../../user/service/user-service/user.service';
import type { ChannelInvitationDto } from '../../dto/channelInvitation.dto';
import { User } from '@prisma/client';

@ApiTags('Channel-Invitations module')
@Controller('channel-invitations')
export class ChannelInvitationsController {
  constructor(
    private channelInvitationsService: ChannelInvitationsService,
    private userService: UserService,
  ) {}

  @Get('GetPendingInvitations')
  async GetInvitations(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitationDto[]> {
    return this.channelInvitationsService.getPendingInvitations(userId);
  }

  @Post('InviteUserToChannel')
  async InviteUserToChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('inviteeId', ParseIntPipe) inviteeId: number,
    @Query('inviterId', ParseIntPipe) inviterId: number,
  ): Promise<ChannelInvitation> {
    return this.channelInvitationsService.inviteUserToChannel(
      channelId,
      inviteeId,
      inviterId,
    );
  }

  @Post('InviteUserNameToChannel')
  async InviteUserNameToChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('inviteeName') inviteeName: string,
    @Query('inviterId', ParseIntPipe) inviterId: number,
  ): Promise<ChannelInvitation> {
    const user = await this.userService.findByUsername(inviteeName);
    const inviteeId = user.id;
    console.log(inviteeId);
    return this.channelInvitationsService.inviteUserToChannel(
      channelId,
      inviteeId,
      inviterId,
    );
  }

  @Patch('RejectInvitation')
  async RejectInvitation(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitation> {
    return this.channelInvitationsService.rejectInvitation(channelId, userId);
  }

  @Delete('AcceptInvitation')
  async AcceptInvitation(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInvitation> {
    return this.channelInvitationsService.acceptInvitation(channelId, userId);
  }
}
