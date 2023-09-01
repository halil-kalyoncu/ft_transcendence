import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelInvitation, ChannelInvitationStatus, ChannelMemberRole } from '@prisma/client';
import { ChannelService } from '../channel/channel.service';
import type { ChannelMembershipDto } from 'src/chat/dto/channel.dto';


@Injectable()
export class ChannelInvitationsService {
	constructor(
		private prisma: PrismaService,
		private ChannelService: ChannelService
	) { }

	async inviteUserToChannel(channelId: number, inviteeId: number, inviterId: number): Promise<ChannelInvitation> {
		await this.ErrorCheckInvite(channelId, inviteeId, inviterId);

		const invitation = await this.prisma.channelInvitation.create({
			data: {
				channelId: channelId,
				inviteeId: inviteeId,
				inviterId: inviterId,
				createdAt: new Date(),

			}
		});
		return invitation;
	}

	async acceptInvitation(channelId: number, userId: number): Promise<ChannelInvitation> {
		//TODO ERROR HANDLING
		const invitation = await this.prisma.channelInvitation.findUnique({
			where: { channelId_inviteeId: { channelId: channelId, inviteeId: userId } }
		});

		if (!invitation) {
			throw new Error(`User with id ${userId} has no invitation to channel with id ${channelId}`);
		}

		const ChannelMembershipDto: ChannelMembershipDto = {
			channelId: channelId,
			userId: userId,
		}
		this.ChannelService.addUserToChannel(ChannelMembershipDto)

		//delete invitation
		await this.prisma.channelInvitation.delete({
			where: { channelId_inviteeId: { channelId: channelId, inviteeId: userId } }
		});

		// await this.prisma.channelInvitation.update({
		// 	where: { channelId_inviteeId: {channelId:channelId, inviteeId:userId}},
		// 	data: {
		// 		status: ChannelInvitationStatus.ACCEPTED,
		// 	},
		// });

		return invitation;
	}

	async rejectInvitation(channelId: number, userId: number): Promise<ChannelInvitation> {
		const invitation = await this.prisma.channelInvitation.findUnique({
			where: { channelId_inviteeId: { channelId: channelId, inviteeId: userId } }
		});

		if (!invitation) {
			throw new Error(`User with id ${userId} has no invitation to channel with id ${channelId}`);
		}

		//decline invitation
		const invitation_updated = await this.prisma.channelInvitation.update({
			where: { channelId_inviteeId: { channelId: channelId, inviteeId: userId },
			},data: {
				status: ChannelInvitationStatus.REJECTED,
			 }
		});

		return invitation_updated;
	}

	async ErrorCheckInvite(channelId: number, inviteeId: number, inviterId: number) {

		const channel = await this.prisma.channel.findUnique({
			where: { id: channelId },
			include: {
				invitations: true,
				members: true,
			}
		});

		if (!channel) {

			throw new Error(`Channel with id ${channelId} not found`);
		}

		const invitee = await this.prisma.user.findUnique({ where: { id: inviteeId } });
		if (!invitee) {
			throw new Error(`User with id ${inviteeId} not found`);
		}

		const inviter = await this.prisma.channelMember.findUnique({ where: { 
			userId_channelId: { channelId: channelId, userId: inviterId}
			}});
		if (!inviter) {
			throw new Error(`User with id ${inviterId} not found`);
		}

		if (inviter.role !== ChannelMemberRole.OWNER && inviter.role !== ChannelMemberRole.ADMIN) {
			throw new Error(`User with id ${inviterId} is not allowed to invite users`);
		}

		if (channel.members.find(member => member.userId === inviteeId)) {
			throw new Error(`User with id ${inviteeId} is already a member of channel with id ${channelId}`);
		}

		const existingInvitation = await this.prisma.channelInvitation.findUnique({
			where: { channelId_inviteeId: { channelId: channelId, inviteeId: inviteeId } }
		});

		if (existingInvitation) {
			if (existingInvitation.status === ChannelInvitationStatus.REJECTED) {
				console.log('User already recjected invitation. New invitation will be send.')
				await this.prisma.channelInvitation.delete({
					where: { channelId_inviteeId: { channelId: channelId, inviteeId: inviteeId } }
				});
				return 
			}
			if (existingInvitation.status === ChannelInvitationStatus.PENDING) {
			throw new Error(`User with id ${inviteeId} is already invited to channel with id ${channelId}`);
		}
	}
		return
	}
}
