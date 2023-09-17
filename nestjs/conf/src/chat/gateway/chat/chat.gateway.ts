import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { FriendshipService } from '../../../chat/service/friendship/friendship.service';
import { ChannelService } from '../../../chat/service/channel/channel.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { DirectMessageService } from '../../../chat/service/direct-message/direct-message.service';
import { ChannelInvitationsService } from '../../service/channel-invitations/channel-invitations.service';
import { CreateDirectMessageDto } from '../../dto/create-direct-message.dto';
import {
	CreateChannelDto,
	SetPasswordDto,
	DeletePasswordDto,
	AdminActionDto,
	ChannelMembershipDto,
} from '../../dto/channel.dto';
import {
	ChannelVisibility,
	ConnectedUser,
	ChannelMember,
	DirectMessage,
	Friendship,
	FriendshipStatus,
	User,
	Match,
	Matchmaking,
	Prisma,
	Channel,
} from '@prisma/client';
import { FriendshipDto } from '../../dto/friendship.dto';
import { ChannelMessageService } from '../../../chat/service/channel-message/channel-message.service';
import {
	CreateChannelMessageDto,
	DestroyChannelDto,
} from '../../dto/create-channel-message.dto';
import { SendGameInviteDto } from '../../../chat/dto/send-game-invite.dto';
import { MatchService } from '../../../match/service/match.service';
import { ErrorDto } from '../../../chat/dto/error.dto';
import { MatchmakingService } from '../../../matchmaking/service/matchmaking.service';

@WebSocketGateway({
	cors: {
		origin: ['http://localhost:3000', 'http://localhost:4200'],
	},
	path: '/chat',
})
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
	@WebSocketServer()
	server: Server;

	constructor(
		private jwtAuthService: JwtAuthService,
		private userService: UserService,
		private friendshipService: FriendshipService,
		private channelService: ChannelService,
		private connectedUserService: ConnectedUserService,
		private directMessageService: DirectMessageService,
		private channelMessageService: ChannelMessageService,
		private matchService: MatchService,
		private channelInvitationService: ChannelInvitationsService,
		private matchmakingService: MatchmakingService,
	) { }

	async onModuleInit(): Promise<void> {
		await this.connectedUserService.deleteAll();
	}

	async handleConnection(socket: Socket, ...args: any[]): Promise<void> {
		try {
			//Authorization has the format Bearer <access_token>, remove Bearer to verify the token
			const tokenArray: string[] =
				socket.handshake.headers.authorization.split(' ');
			const decodedToken = await this.jwtAuthService.verifyJwt(tokenArray[1]);
			const user: User = await this.userService.findById(decodedToken.user.id);
			if (!user) {
				return this.disconnectUnauthorized(socket);
			}
			//save user data in socket
			socket.data.user = user;

			//save user in connectedUsers
			const connectedUser = await this.connectedUserService.create({
				socketId: socket.id,
				user: { connect: { id: user.id } },
			});

			this.updateFriendsOf(user.id);
			this.sendFriendsToClient(connectedUser);
			this.sendFriendRequestsToClient(connectedUser);
		} catch {
			this.disconnectUnauthorized(socket);
		}
	}

	async handleDisconnect(socket: Socket): Promise<void> {
		if (socket.data && socket.data.user) {
			this.updateFriendsOf(socket.data.user.id);
		}
		await this.connectedUserService.deleteBySocketId(socket.id);
		socket.disconnect();
	}

	/*****************
	 *** Friendlist ***
	 ******************/

	@SubscribeMessage('sendFriendRequest')
	async sendFriendRequest(
		socket: Socket,
		receiverUsername: string,
	): Promise<Friendship | ErrorDto> {
		try {
			const receiver: User = await this.userService.findByUsername(
				receiverUsername,
			);
			if (!receiver) {
				throw new Error('User not found');
			} else if (socket.data.user.username === receiverUsername) {
				throw new Error("Can't add yourself");
			}

			const friendship: Friendship = await this.friendshipService.create({
				sender: { connect: { id: socket.data.user.id } },
				receiver: { connect: { id: receiver.id } },
			});

			const receiverOnline: ConnectedUser =
				await this.connectedUserService.findByUser(receiver);
			if (receiverOnline) {
				this.sendFriendRequestsToClient(receiverOnline);
			}
			return friendship;
		} catch (error) {
			return { error: error.message as string };
		}
	}


	@SubscribeMessage('acceptFriendRequest')
	async acceptFriendRequest(
		socket: Socket,
		friendshipId: number,
	): Promise<Friendship | ErrorDto> {
		try {
			const friendship: Friendship =
				await this.friendshipService.acceptFriendshipRequest(friendshipId);
			if (!friendship) {
				throw new Error('Friendship entry not found');
			}
			// else if (friendship.status === FriendshipStatus.BLOCKED) {
			//   throw new Error(
			//     "This is marked as blocked user, this shouldn't have happend. Please contact a System Admin",
			//   );
			// }

			const senderOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.senderId);
			const receiverOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.receiverId);
			if (senderOnline) {
				this.sendFriendsToClient(senderOnline);
			}
			if (receiverOnline) {
				this.sendFriendRequestsToClient(receiverOnline);
				this.sendFriendsToClient(receiverOnline);
			}
			return friendship;
		} catch (error) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('rejectFriendRequest')
	async rejectFriendRequest(
		socket: Socket,
		friendshipId: number,
	): Promise<Friendship | ErrorDto> {
		try {
			const friendship: Friendship =
				await this.friendshipService.rejectFriendshipRequest(friendshipId);
			if (!friendship) {
				throw new Error('Friendship entry not found');
			}
			// else if (friendship.status === FriendshipStatus.BLOCKED) {
			//   throw new Error(
			//     "This is marked as blocked user, this shouldn't have happend. Please contact a System Admin",
			//   );
			// }
			const senderOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.senderId);
			const receiverOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.receiverId);
			if (!!senderOnline) {
				this.sendFriendsToClient(senderOnline);
			}
			if (!!receiverOnline) {
				this.sendFriendRequestsToClient(receiverOnline);
				this.sendFriendsToClient(receiverOnline);
			}
			return friendship;
		} catch (error) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('removeFriend')
	async removeFriend(
		socket: Socket,
		friendshipId: number,
	): Promise<Friendship | { error: string }> {
		try {
			const friendship = await this.friendshipService.getOne(friendshipId);
			if (!friendship) {
				throw new Error('Friendship entry not found');
			}
			// else if (friendship.status === FriendshipStatus.BLOCKED) {
			//   throw new Error(
			//     "This is marked as blocked user, this shouldn't have happend. Please contact a System Admin",
			//   );
			// }
			const senderOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.senderId);
			const receiverOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(friendship.receiverId);

			await this.friendshipService.remove(friendshipId);
			if (senderOnline) {
				this.sendFriendsToClient(senderOnline);
			}
			if (receiverOnline) {
				this.sendFriendsToClient(receiverOnline);
			}
			return friendship;
		} catch (error) {
			return { error: error.message };
		}
	}

	// @SubscribeMessage('blockUser')
	// async blockUser(
	//   socket: Socket,
	//   userId: number,
	// ): Promise<Friendship | { error: string }> {
	//   let updateFriendlist = false;

	//   try {
	//     if (socket.data.user.id === userId) {
	//       throw new Error("Can't block yourself");
	//     }
	//     const friendship = await this.friendshipService.find(
	//       socket.data.user.id,
	//       userId,
	//     );
	//     console.log('friendship');
	//     if (friendship && friendship.status === FriendshipStatus.ACCEPTED) {
	//       updateFriendlist = true;
	//     }
	//     const blockEntry = await this.friendshipService.block({
	//       sender: { connect: { id: socket.data.user.id } },
	//       receiver: { connect: { id: userId } },
	//     });

	//     const receiverOnline: ConnectedUser =
	//       await this.connectedUserService.findByUserId(blockEntry.receiverId);
	//     if (updateFriendlist && receiverOnline) {
	//       this.sendFriendsToClient(receiverOnline);
	//     }
	//     return blockEntry;
	//   } catch (error) {
	//     return { error: error.message };
	//   }
	// }

	/*********************
	 *** DirectMessages ***
	 **********************/

	@SubscribeMessage('sendDirectMessage')
	async sendDirectMessage(
		socket: Socket,
		createDirectMessageDto: CreateDirectMessageDto,
	): Promise<void> {
		const newMessage = await this.directMessageService.create(
			createDirectMessageDto,
		);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(
				createDirectMessageDto.receiverId,
			);

		//sender
		socket.emit('newDirectMessage', newMessage);
		//receiver
		if (receiverOnline) {
			this.server
				.to(receiverOnline.socketId)
				.emit('newDirectMessage', newMessage);
		}
	}

	/**************
	 *** Channel ***
	 ***************/

	@SubscribeMessage('createUnProtectedChannel')
	async handleCreateUnProtectedChannel(
		@ConnectedSocket() socket: Socket,
		@MessageBody() createChannelDto: CreateChannelDto,
	): Promise<Channel | { error: string }> {
		try {
			const newChannel = await this.channelService.createUnProtectedChannel(
				createChannelDto,
			);
			socket.emit('channelCreated', true);
			const onlineMembers: ConnectedUser[] =
				await this.connectedUserService.getAll();
			for (const onlineMember of onlineMembers) {
				if (onlineMember) {
					socket.to(onlineMember.socketId).emit('channelCreated', true);
				}
			}
			return (newChannel)
		} catch (error) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('createProtectedChannel')
	async handlecreateProtectedChannel(
		@ConnectedSocket() socket: Socket,
		@MessageBody() createChannelDto: CreateChannelDto,
	): Promise<Channel | ErrorDto> {
		try {
			const newChannel = await this.channelService.createProtectedChannel(
				createChannelDto,
			);
			socket.emit('channelCreated', true);
			const onlineMembers: ConnectedUser[] =
				await this.connectedUserService.getAll();
			for (const onlineMember of onlineMembers) {
				if (onlineMember) {
					socket.to(onlineMember.socketId).emit('channelCreated', true);
				}
			}
			return newChannel;
		} catch (error) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('setChannelPassword')
	async handleSetPassword(
		socket: Socket,
		setPasswordDto: SetPasswordDto,
	): Promise<Channel | ErrorDto> {
		try {
			const channel = await this.channelService.setPassword(setPasswordDto);

			const members: User[] = await this.channelService.getMembers(
				setPasswordDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== setPasswordDto.userId
				) {
					socket.to(memberOnline.socketId).emit('passwordSet', channel.name);
				}
			}
			return channel;
		} catch (error) {
			return { error: error.message };
		}
	}

	@SubscribeMessage('deleteChannelPassword')
	async handleDeletePassword(
		socket: Socket,
		@MessageBody() deletePasswordDto: DeletePasswordDto,
	): Promise<void> {
		try {
			const channel = await this.channelService.deletePassword(
				deletePasswordDto,
			);
			socket.emit('passwordDeleted', channel);
		} catch (error) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		socket: Socket,
		@MessageBody() channelMembershipDto: ChannelMembershipDto,
	): Promise<void> {
		try {
			const membership = await this.channelService.addUserToChannel(
				channelMembershipDto,
			);
			socket.emit('joinedChannel', membership);
		} catch (error) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(
		socket: Socket,
		@MessageBody() channelMembershipDto: ChannelMembershipDto,
	): Promise<void> {
		try {
			const membership = await this.channelService.removeUserFromChannel(
				channelMembershipDto,
			);
			socket.emit('leftChannel', membership);
		} catch (error) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('makeChannelAdmin')
	async handleMakeAdmin(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<void> {
		try {
			const membership = await this.channelService.makeAdmin(adminActionDto);
			const target = await this.userService.findById(adminActionDto.targetUserId);
			socket.emit('madeAdmin', target.username);
			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== adminActionDto.requesterId
				) {
					socket.to(memberOnline.socketId).emit('madeAdmin', target.username);
				}
			}
		} catch (error: any) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('kickChannelMember')
	async handleKickChannelMember(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<string | ErrorDto> {
		try {
			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			const membership = await this.channelService.kickChannelMember(adminActionDto);
			const targetUser = await this.userService.findById(adminActionDto.targetUserId);
			const channel = await this.channelService.find(adminActionDto.channelId);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (memberOnline) {
					socket.to(memberOnline.socketId).emit('memberKicked', targetUser.username, adminActionDto.channelId, channel.name);
				}
			}
	
			socket.emit('memberKicked', targetUser.username, adminActionDto.channelId, channel.name);
			return targetUser.username;
		} catch (error: any) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('banChannelMember')
	async handleBanChannelMember(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<void> {
		try {
			await this.channelService.banChannelMember(
				adminActionDto,
			);
			const bannedUser = await this.userService.findById(adminActionDto.targetUserId);
			socket.emit('memberBanned', bannedUser.username, adminActionDto.channelId);

			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== adminActionDto.requesterId
				) {
					socket.to(memberOnline.socketId).emit('memberBanned', bannedUser.username, adminActionDto.channelId);
				}
			}
		} catch (error: any) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('unBanChannelMember')
	async handleUnBanChannelMember(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<void> {
		try {
			const membership = await this.channelService.unBanChannelMember(
				adminActionDto,
			);
			const unBannedUser = await this.userService.findById(adminActionDto.targetUserId);
			const channel = await this.channelService.find(adminActionDto.channelId);
			socket.emit('memberUnBanned', unBannedUser.username, channel.id, channel.name);
			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== adminActionDto.requesterId
				) {
					socket.to(memberOnline.socketId).emit('memberUnBanned', unBannedUser.username, channel.id, channel.name);
				}
			}
		} catch (error: any) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('muteChannelMember')
	async handleMuteChannelMember(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<void> {
		try {
			await this.channelService.muteChannelMember(
				adminActionDto
			);
			const target = await this.userService.findById(adminActionDto.targetUserId);
			const channel = await this.channelService.find(adminActionDto.channelId);
			socket.emit('memberMuted', target.username, channel.id, channel.name, adminActionDto.minutesToMute);
			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== adminActionDto.requesterId
				) {
					socket.to(memberOnline.socketId).emit('memberMuted', target.username, channel.id, channel.name, adminActionDto.minutesToMute);
				}
			}
		} catch (error: any) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('unMuteChannelMember')
	async handleUnMuteChannelMember(
		socket: Socket,
		adminActionDto: AdminActionDto,
	): Promise<void> {
		try {
			await this.channelService.unMuteChannelMember(
				adminActionDto,
			);
			const target = await this.userService.findById(adminActionDto.targetUserId);
			const channel = await this.channelService.find(adminActionDto.channelId);
			socket.emit('memberUnMuted', target.username, channel.id, channel.name);
			const members: User[] = await this.channelService.getMembers(
				adminActionDto.channelId,
			);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (
					memberOnline &&
					memberOnline.userId !== adminActionDto.requesterId
				) {
					socket.to(memberOnline.socketId).emit('memberUnMuted', target.username, channel.id, channel.name);
				}
			}
		} catch (error: any) {
			socket.emit('error', error.message);
		}
	}

	@SubscribeMessage('sendUpdateUnMuted')
	async handleSendUpdateUnMuted(
		socket: Socket,
		membersToUnmute: ChannelMember[],
	): Promise<ChannelMember[] | ErrorDto> {
		try {
			const channelMembers: ChannelMember[] = await this.channelService.findMembers(membersToUnmute[0].channelId);

			for (const member of membersToUnmute) {
				for (const channelMember of channelMembers) {
					socket.emit('memberUnMuted', member);
					const onlineMember = await this.findOnlineMember(channelMember.userId);
					if (onlineMember) {
						console.log('memberUnMuted')
						console.log(onlineMember)
						socket.to(onlineMember.socketId).emit('memberUnMuted', member);
					}
				}
			}
			return membersToUnmute;
		}
		catch (error: any) {
			return { error: error.message };
		}
	}

	@SubscribeMessage('DestroyChannel')
	async handleDestroyChannel(
		socket: Socket,
		destroyChannelDto: DestroyChannelDto,
	): Promise<number | ErrorDto> {
		try {
			const { senderId, channelId } = destroyChannelDto;
			const members: User[] = await this.channelService.getMembers(channelId);
			socket.emit('ChannelDestroy', channelId);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (memberOnline) {
					socket.to(memberOnline.socketId).emit('ChannelDestroy',channelId);
				}
			}
			this.channelService.destroyChannel(channelId);
			return channelId;
		} catch (error: any) {
			return { error: error.message };
		}
	}


	@SubscribeMessage('SignOutChannel')
	async handleSignOutChannel(
		socket: Socket,
		ChannelMembershipDto: ChannelMembershipDto,
	): Promise<ChannelMember | ErrorDto> {
		try{
			const { userId, channelId } = ChannelMembershipDto;
			const members: User[] = await this.channelService.getMembers(channelId);
			const sender = await this.userService.findById(userId);
			const channelMember = await this.channelService.removeUserFromChannel(ChannelMembershipDto);
			socket.emit('UserSignedOut', sender.username, channelId);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (memberOnline) {
					socket.to(memberOnline.socketId).emit('UserSignedOut', sender.username, channelId);
				}
			}
			return channelMember
		} catch (error: any) {
			return { error: error.message };
		}
	}

	@SubscribeMessage('SignInChannel')
	async handleSignInChannel(socket: Socket,
		data: {
			channelId: number,
			username: string
		}): Promise<string> {
		const { channelId, username } = data;
		socket.emit('UserSignedIn', username, channelId);
		const members: User[] = await this.channelService.getMembers(channelId);
		for (const member of members) {
			const memberOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(member.id);
			if (memberOnline) {
				socket.to(memberOnline.socketId).emit('UserSignedIn', username, channelId);
			}
		}
		return username
	}
	/**********************
	 *** ChannelMessages ***
	 ***********************/

	@SubscribeMessage('groupMessages')
	async handlegetGroupMessages(socket: Socket, channelId: number) {
		return await this.channelMessageService.getChannelMessagesforChannel(
			channelId,
		);
	}

	@SubscribeMessage('sendChannelMessage')
	async sendChannelMessage(
		socket: Socket,
		createChannelMessageDto: CreateChannelMessageDto,
	): Promise<any | ErrorDto> {
		try {
			const { senderId, channelId, message } = createChannelMessageDto;
			const newMessage = await this.channelMessageService.createChannelMessageI(
				createChannelMessageDto,
			);

			const members: User[] = await this.channelService.getMembers(
				createChannelMessageDto.channelId,
			);

			socket.emit('newChannelMessage', newMessage);
			for (const member of members) {
				const memberOnline: ConnectedUser =
					await this.connectedUserService.findByUserId(member.id);
				if (memberOnline && memberOnline.userId !== senderId) {
					socket.to(memberOnline.socketId).emit('newChannelMessage', newMessage);
				}
			}
			return newMessage
		} catch (error: any) {
			return { error: error.message as string };
		}
	}
	/**********************
	 *** ChannelInvitations ***
	 ***********************/
	@SubscribeMessage('acceptChannelInvitation')
	async handleAcceptChannelInvitation(
		socket: Socket,
		invitationId: number,
	): Promise<void> {
		const invitation = await this.channelInvitationService.getOne(invitationId);
		await this.channelInvitationService.acceptInvitation(
			invitation.channelId,
			invitation.inviteeId,
		);
		const channelName = invitation.channel.name;
		const inviteeName = invitation.invitee.username;
		socket.emit('ChannelInvitationAccepted', channelName, inviteeName);
		const members: User[] = await this.channelService.getMembers(
			invitation.channelId,
		);
		for (const member of members) {
			const memberOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(member.id);
			if (memberOnline) {
				socket
					.to(memberOnline.socketId)
					.emit('ChannelInvitationAccepted', channelName, inviteeName);
			}
		}
	}

	@SubscribeMessage('rejectChannelInvitation')
	async handleRejectChannelInvitation(
		socket: Socket,
		invitationId: number,
	): Promise<void> {
		const invitation = await this.channelInvitationService.getOne(invitationId);
		await this.channelInvitationService.rejectInvitation(
			invitation.channelId,
			invitation.inviteeId,
		);
		const channelName = invitation.channel.name;
		const inviteeName = invitation.invitee.username;
		socket.emit('ChannelInvitationRejected', channelName, inviteeName);
		const inviterOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(invitation.inviterId);
		if (inviterOnline) {
			socket
				.to(inviterOnline.socketId)
				.emit('ChannelInvitationRejected', channelName, inviteeName);
		}
	}

	@SubscribeMessage('gotChannelInvitation')
	async handlGotChannelInvitation(
		socket: Socket,
		inviteeUsername: string,
	): Promise<User | ErrorDto> {
		try {
			const invitee = await this.userService.findByUsername(inviteeUsername);
			if (!invitee) {
				throw new Error('User not found');
			}
			const inviteeOnline: ConnectedUser =
				await this.connectedUserService.findByUserId(invitee.id);
			if (inviteeOnline) {
				socket.to(inviteeOnline.socketId).emit('NewChannelInvitation');
			}
			return invitee
		} catch (error: any) {
			return { error: error.message as string };
		}
	}
	/******************
	 *** MatchInvites ***
	 *******************/

	@SubscribeMessage('sendMatchInvite')
	async sendGameInvite(
		socket: Socket,
		sendGameInviteDto: SendGameInviteDto,
	): Promise<void> {
		if (sendGameInviteDto.invitedUserId === socket.data.user.id) {
			socket.emit('Error', "Can't invite yourself to a game");
			return;
		}
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(
				sendGameInviteDto.invitedUserId,
			);

		if (!receiverOnline) {
			socket.emit('Error', 'User is not online');
			return;
		}

		const updatedMatch: Match = await this.matchService.invite(
			sendGameInviteDto.matchId,
			sendGameInviteDto.invitedUserId,
		);
		socket.emit('matchInviteSent', updatedMatch);
		socket.to(receiverOnline.socketId).emit('matchInvites', updatedMatch);
	}

	@SubscribeMessage('acceptMatchInvite')
	async acceptGameInvite(socket: Socket, matchId: number): Promise<void> {
		const match: Match = await this.matchService.findById(matchId);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(match.leftUserId);

		if (!receiverOnline) {
			socket.emit('Error', 'Match creator is not online');
			return;
		}

		const updatedMatch: Match = await this.matchService.acceptInvite(matchId);
		socket.emit('matchInvites');
		socket
			.to(receiverOnline.socketId)
			.emit('matchInviteAccepted', updatedMatch);
	}

	@SubscribeMessage('rejectMatchInvite')
	async rejectGameInvite(socket: Socket, matchId: number): Promise<void> {
		const updatedMatch: Match = await this.matchService.rejectInvite(matchId);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(updatedMatch.leftUserId);

		socket.emit('matchInvites');
		if (receiverOnline) {
			socket
				.to(receiverOnline.socketId)
				.emit('matchInviteRejected', updatedMatch);
		}
	}
	/************
	*** Match ***
	*************/
	@SubscribeMessage('hostLeaveMatch')
	async hostLeaveMatch(socket: Socket, matchId: number): Promise<void> {
		const match: Match = await this.matchService.findById(matchId);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(match.rightUserId);

		if (receiverOnline) {
			socket.to(receiverOnline.socketId).emit('hostLeftMatch');
		}
		this.matchService.deleteById(match.id);
	}

	@SubscribeMessage('leaveMatch')
	async leaveMatch(socket: Socket, matchId: number): Promise<void> {
		const updatedMatch: Match = await this.matchService.rejectInvite(matchId);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(updatedMatch.leftUserId);

		if (receiverOnline) {
			socket.to(receiverOnline.socketId).emit('leftMatch', updatedMatch);
		}
	}

	@SubscribeMessage('startMatch')
	async startMatch(socket: Socket, matchId: number): Promise<void> {
		const match: Match = await this.matchService.findById(matchId);
		const receiverOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(match.rightUserId);

		if (!receiverOnline) {
			socket.emit('Error', 'Opponent is not online');
			return;
		}

		const updatedMatch: Match = await this.matchService.startMatch(matchId);
		this.updateFriendsOf(socket.data.user.id);
		this.updateFriendsOf(match.rightUserId);
		socket.emit('goToGame', updatedMatch);
		socket.to(receiverOnline.socketId).emit('goToGame', updatedMatch);
	}

	@SubscribeMessage('finishedMatch')
	async finishedMatch(socket: Socket): Promise<void> {
		this.updateFriendsOf(socket.data.user.id);
	}

	/******************
	 *** Matchmaking ***
	 ******************/

	@SubscribeMessage('queueUpForLadder')
	async queueUpForLadder(socket: Socket): Promise<Matchmaking | ErrorDto> {
		let existingMatchmaking: Matchmaking;
		let findOpponent: Matchmaking;
		let waitForPlayer: Matchmaking;
		let connectedUser: ConnectedUser;

		try {
			//looking for exisiting entry if user reconnects, presses refresh
			existingMatchmaking = await this.matchmakingService.getByUserId(
				socket.data.user.id,
			);
			if (existingMatchmaking) {
				return existingMatchmaking;
			}

			//looking if another player is looking for a game with a similiar ladderLevel
			findOpponent = await this.matchmakingService.findOpponent(
				socket.data.user.id,
			);
			if (findOpponent) {
				const ladderGameData: Prisma.MatchCreateInput = {
					type: 'LADDER',
					leftUser: { connect: { id: findOpponent.userId } },
					rightUser: { connect: { id: socket.data.user.id } },
				};
				connectedUser = await this.connectedUserService.findByUserId(
					findOpponent.userId,
				);
				if (!connectedUser) {
					return { error: 'Opponent is not online' };
				}
				socket.to(connectedUser.socketId).emit('readyLadderGame', findOpponent);
				socket.emit('readyLadderGame', findOpponent);
				return findOpponent;
			}

			//create entry in matchmaking and wait
			waitForPlayer = await this.matchmakingService.createByUserId(
				socket.data.user.id,
			);
			return waitForPlayer;
		} catch (error) {
			return { error: error.message as string };
		}
	}

	@SubscribeMessage('startLadderGame')
	async startLadderMatch(
		socket: Socket,
		matchmakingId: number,
	): Promise<Match | ErrorDto> {
		let matchmaking: Matchmaking;
		let ladderMatch: Match;
		let connectedUser: ConnectedUser;

		try {
			matchmaking = await this.matchmakingService.find(matchmakingId);
			if (!matchmaking || matchmaking.userId !== socket.data.user.id) {
				return { error: 'Something went wrong starting the ladder game' };
			}

			const ladderGameData: Prisma.MatchCreateInput = {
				type: 'LADDER',
				leftUser: { connect: { id: matchmaking.userId } },
				rightUser: { connect: { id: matchmaking.opponentUserId } },
			};
			ladderMatch = await this.matchService.create(ladderGameData);
			connectedUser = await this.connectedUserService.findByUserId(
				matchmaking.opponentUserId,
			);
			if (!connectedUser) {
				await this.matchService.deleteById(ladderMatch.id);
				await this.matchmakingService.deleteByUserId(matchmaking.userId);
				return { error: 'Opponent is not online' };
			}
			await this.matchmakingService.deleteByUserId(matchmaking.userId);
			socket.to(connectedUser.socketId).emit('goToLadderGame', ladderMatch);
			socket.emit('goToLadderGame', ladderMatch);
		} catch (error) {
			return { error: error.message as string };
		}
	}

	/**********************
	 *** Helperfunctions ***
	 ***********************/

	private async sendFriendsToClient(
		connectedUser: ConnectedUser,
	): Promise<void> {
		// const friends: FriendshipDto[] = await this.friendshipService.getFriends(
		//   connectedUser.userId,
		// );
		this.server.to(connectedUser.socketId).emit('friends');
	}

	private async sendFriendRequestsToClient(
		connectedUser: ConnectedUser,
	): Promise<void> {
		// const requests: FriendshipDto[] =
		//   await this.friendshipService.getFriendRequests(connectedUser.userId);
		this.server.to(connectedUser.socketId).emit('friendRequests');
	}

	private async updateFriendsOf(aboutClientId: number): Promise<void> {
		const friends: FriendshipDto[] = await this.friendshipService.getFriends(
			aboutClientId,
		);

		for (const friendEntry of friends) {
			const friendOnline: ConnectedUser =
				await this.connectedUserService.findByUser(friendEntry.friend);
			if (!!friendOnline) {
				this.sendFriendsToClient(friendOnline);
			}
		}
	}

	private disconnectUnauthorized(socket: Socket): void {
		socket.emit('Error', new UnauthorizedException());
		socket.disconnect();
	}

	private async findOnlineMember(userId: number): Promise<ConnectedUser> {
		const memberOnline: ConnectedUser =
			await this.connectedUserService.findByUserId(userId);
		return memberOnline;
	}
}
