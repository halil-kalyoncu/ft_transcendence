import {
  BadRequestException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
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
  Powerup,
  BlockedUser,
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
import { PowerupService } from '../../../powerup/service/powerup.service';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';
import { ChannelInvitation } from 'src/_gen/prisma-class/channel_invitation';
import { validate } from 'class-validator';
import {
  GotChannelInvitationDto,
  SignInChannelDto,
} from '../../../chat/dto/channelInvitation.dto';

@WebSocketGateway({
  cors: {
    origin: [
      `http://${process.env.IP_ADDRESS}:${process.env.FRONTEND_PORT}`,
      `http://${process.env.IP_ADDRESS}:${process.env.BACKEND_PORT}`,
    ],
  },
  path: '/chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
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
    private powerupService: PowerupService,
    private blockedUserService: BlockedUserService,
  ) {}

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
    @ConnectedSocket() socket: Socket,
    @MessageBody() receiverUsername: string,
  ): Promise<Friendship | ErrorDto> {
    try {
      this.checkStringInput(receiverUsername, 'Invalid username');

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
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendshipId: number,
  ): Promise<Friendship | ErrorDto> {
    try {
      this.checkNumberInput(friendshipId, 'Invalid friendship id');

      if (!Number.isInteger(friendshipId) || friendshipId <= 0) {
        throw new Error('Invalid friendship id');
      }

      const friendship: Friendship =
        await this.friendshipService.acceptFriendshipRequest(friendshipId);
      if (!friendship) {
        throw new Error('Friendship entry not found');
      }

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
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendshipId: number,
  ): Promise<Friendship | ErrorDto> {
    try {
      this.checkNumberInput(friendshipId, 'Invalid friendship id');

      const friendship: Friendship =
        await this.friendshipService.rejectFriendshipRequest(friendshipId);
      if (!friendship) {
        throw new Error('Friendship entry not found');
      }

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

  @SubscribeMessage('removeFriend')
  async removeFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friendshipId: number,
  ): Promise<Friendship | { error: string }> {
    try {
      this.checkNumberInput(friendshipId, 'Invalid friendship id');

      const friendship = await this.friendshipService.getOne(friendshipId);
      if (!friendship) {
        throw new Error('Friendship entry not found');
      }

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

  /*********************
   *** DirectMessages ***
   **********************/

  @SubscribeMessage('sendDirectMessage')
  async sendDirectMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createDirectMessageDto: CreateDirectMessageDto,
  ): Promise<void> {
    await this.validateDto(createDirectMessageDto);

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
  ): Promise<Channel | ErrorDto> {
    try {
      await this.validateDto(createChannelDto);

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
      return newChannel;
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
      await this.validateDto(createChannelDto);

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
    @ConnectedSocket() socket: Socket,
    @MessageBody() setPasswordDto: SetPasswordDto,
  ): Promise<Channel | ErrorDto> {
    try {
      await this.validateDto(setPasswordDto);

      const channel = await this.channelService.setPassword(setPasswordDto);

      const members: User[] = await this.channelService.getMembers(
        setPasswordDto.channelId,
      );
      for (const member of members) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline && memberOnline.userId !== setPasswordDto.userId) {
          socket.to(memberOnline.socketId).emit('passwordSet', channel.name);
        }
      }
      return channel;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('deleteChannelPassword')
  async handleDeletePassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody() deletePasswordDto: DeletePasswordDto,
  ): Promise<Channel | ErrorDto> {
    try {
      await this.validateDto(deletePasswordDto);

      const channel = await this.channelService.deletePassword(
        deletePasswordDto,
      );
      socket.emit('passwordDeleted', channel);
      return channel;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember | ErrorDto> {
    try {
      await this.validateDto(channelMembershipDto);

      const membership = await this.channelService.addUserToChannel(
        channelMembershipDto,
      );
      socket.emit('joinedChannel', membership);
      return membership;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember | ErrorDto> {
    try {
      await this.validateDto(channelMembershipDto);

      const membership = await this.channelService.removeUserFromChannel(
        channelMembershipDto,
      );
      socket.emit('leftChannel', membership);
      return membership;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('makeChannelAdmin')
  async handleMakeAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<User | ErrorDto> {
    try {
      await this.validateDto(adminActionDto);

      await this.channelService.makeAdmin(adminActionDto);
      const channel = await this.channelService.find(adminActionDto.channelId);
      const target = await this.userService.findById(
        adminActionDto.targetUserId,
      );
      socket.emit('madeAdmin', target.usernamem, channel.name);
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
          socket
            .to(memberOnline.socketId)
            .emit('madeAdmin', target.username, channel.name);
        }
      }
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('kickChannelMember')
  async handleKickChannelMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<User | ErrorDto> {
    try {
      await this.validateDto(adminActionDto);

      const members: User[] = await this.channelService.getMembers(
        adminActionDto.channelId,
      );
      const membership = await this.channelService.kickChannelMember(
        adminActionDto,
      );
      const targetUser = await this.userService.findById(
        adminActionDto.targetUserId,
      );
      const channel = await this.channelService.find(adminActionDto.channelId);
      for (const member of members) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline) {
          socket
            .to(memberOnline.socketId)
            .emit(
              'memberKicked',
              targetUser.username,
              adminActionDto.channelId,
              channel.name,
            );
        }
      }

      socket.emit(
        'memberKicked',
        targetUser.username,
        adminActionDto.channelId,
        channel.name,
      );
      return targetUser;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('banChannelMember')
  async handleBanChannelMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<User | ErrorDto> {
    try {
      this.validateDto(adminActionDto);

      await this.channelService.banChannelMember(adminActionDto);
      const bannedUser = await this.userService.findById(
        adminActionDto.targetUserId,
      );
      socket.emit(
        'memberBanned',
        bannedUser.username,
        adminActionDto.channelId,
      );

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
          socket
            .to(memberOnline.socketId)
            .emit(
              'memberBanned',
              bannedUser.username,
              adminActionDto.channelId,
            );
        }
      }
      return bannedUser;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('unBanChannelMember')
  async handleUnBanChannelMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<User | ErrorDto> {
    try {
      await this.validateDto(adminActionDto);

      await this.channelService.unBanChannelMember(adminActionDto);
      const unBannedUser = await this.userService.findById(
        adminActionDto.targetUserId,
      );
      const channel = await this.channelService.find(adminActionDto.channelId);
      socket.emit(
        'memberUnBanned',
        unBannedUser.username,
        channel.id,
        channel.name,
      );
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
          socket
            .to(memberOnline.socketId)
            .emit(
              'memberUnBanned',
              unBannedUser.username,
              channel.id,
              channel.name,
            );
        }
      }
      return unBannedUser;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('muteChannelMember')
  async handleMuteChannelMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<void> {
    try {
      await this.validateDto(adminActionDto);

      await this.channelService.muteChannelMember(adminActionDto);
      const target = await this.userService.findById(
        adminActionDto.targetUserId,
      );
      const channel = await this.channelService.find(adminActionDto.channelId);
      socket.emit(
        'memberMuted',
        target.username,
        channel.id,
        channel.name,
        adminActionDto.minutesToMute,
      );
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
          socket
            .to(memberOnline.socketId)
            .emit(
              'memberMuted',
              target.username,
              channel.id,
              channel.name,
              adminActionDto.minutesToMute,
            );
        }
      }
    } catch (error: any) {
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('unMuteChannelMember')
  async handleUnMuteChannelMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<User | ErrorDto> {
    try {
      await this.validateDto(adminActionDto);

      await this.channelService.unMuteChannelMember(adminActionDto);
      const target = await this.userService.findById(
        adminActionDto.targetUserId,
      );
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
          socket
            .to(memberOnline.socketId)
            .emit('memberUnMuted', target.username, channel.id, channel.name);
        }
      }
      return target;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('sendUpdateUnMuted')
  async handleSendUpdateUnMuted(
    @ConnectedSocket() socket: Socket,
    @MessageBody() membersToUnmute: ChannelMember[],
  ): Promise<ChannelMember[] | ErrorDto> {
    try {
      const channelMembers: ChannelMember[] =
        await this.channelService.findMembers(membersToUnmute[0].channelId);

      for (const member of membersToUnmute) {
        for (const channelMember of channelMembers) {
          socket.emit('memberUnMuted', member);
          const onlineMember = await this.findOnlineMember(
            channelMember.userId,
          );
          if (onlineMember) {
            console.log('memberUnMuted');
            console.log(onlineMember);
            socket.to(onlineMember.socketId).emit('memberUnMuted', member);
          }
        }
      }
      return membersToUnmute;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('DestroyChannel')
  async handleDestroyChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() destroyChannelDto: DestroyChannelDto,
  ): Promise<Channel | ErrorDto> {
    try {
      this.validateDto(destroyChannelDto);

      const { senderId, channelId } = destroyChannelDto;
      const members: User[] = await this.channelService.getMembers(channelId);
      const channel = await this.channelService.find(channelId);

      await this.channelService.destroyChannel(channelId);
      await socket.emit('ChannelDestroy', channel.name);
      const onlineMembers: ConnectedUser[] =
        await this.connectedUserService.getAll();
      for (const onlineMember of onlineMembers) {
        if (onlineMember) {
          socket.to(onlineMember.socketId).emit('ChannelDestroy', channel.name);
        }
      }
      return channel;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('SignOutChannel')
  async handleSignOutChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() ChannelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember | ErrorDto> {
    try {
      this.validateDto(ChannelMembershipDto);

      const { userId, channelId } = ChannelMembershipDto;
      const members: User[] = await this.channelService.getMembers(channelId);
      const sender = await this.userService.findById(userId);
      const channelMember = await this.channelService.removeUserFromChannel(
        ChannelMembershipDto,
      );
      socket.emit('UserSignedOut', sender.username, channelId);
      for (const member of members) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline) {
          socket
            .to(memberOnline.socketId)
            .emit('UserSignedOut', sender.username, channelId);
        }
      }
      return channelMember;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('SignInChannel')
  async handleSignInChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() signInChannelDto: SignInChannelDto,
  ): Promise<User[] | ErrorDto> {
    try {
      this.validateDto(signInChannelDto);

      const { channelId, username } = signInChannelDto;
      socket.emit('UserSignedIn', username, channelId);
      socket.emit('InvitationObsolete', username, channelId);
      const members: User[] = await this.channelService.getMembers(channelId);
      for (const member of members) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline) {
          socket
            .to(memberOnline.socketId)
            .emit('UserSignedIn', username, channelId);
          socket
            .to(memberOnline.socketId)
            .emit('InvitationObsolete', username, channelId);
        }
      }
      return members;
    } catch (error) {
      return { error: error.message as string };
    }
  }
  /**********************
   *** ChannelMessages ***
   ***********************/

  @SubscribeMessage('sendChannelMessage')
  async sendChannelMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<any | ErrorDto> {
    try {
      this.validateDto(createChannelMessageDto);

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
          socket
            .to(memberOnline.socketId)
            .emit('newChannelMessage', newMessage);
        }
      }
      return newMessage;
    } catch (error: any) {
      return { error: error.message as string };
    }
  }
  /**********************
   *** ChannelInvitations ***
   ***********************/

  @SubscribeMessage('acceptChannelInvitation')
  async handleAcceptChannelInvitation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() invitationId: number,
  ): Promise<ChannelInvitation | ErrorDto> {
    try {
      this.checkNumberInput(invitationId, 'Invalid invitation id');

      const invitation = await this.channelInvitationService.getOne(
        invitationId,
      );
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
          socket
            .to(memberOnline.socketId)
            .emit('ChannelInvitationAcceptedManager', channelName, inviteeName);
        }
      }
      return invitation;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('rejectChannelInvitation')
  async handleRejectChannelInvitation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() invitationId: number,
  ): Promise<ChannelInvitation | ErrorDto> {
    try {
      this.checkNumberInput(invitationId, 'Invalid invitation id');

      const invitation = await this.channelInvitationService.getOne(
        invitationId,
      );
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
      return invitation;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('gotChannelInvitation')
  async handlGotChannelInvitation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() gotChannelInvationDto: GotChannelInvitationDto,
  ): Promise<User | ErrorDto> {
    try {
      await this.validateDto(gotChannelInvationDto);

      const { channelId, inviteeUsername } = gotChannelInvationDto;
      const invitee = await this.userService.findByUsername(inviteeUsername);
      if (!invitee) {
        throw new Error('User not found');
      }
      const inviteeOnline = await this.connectedUserService.findByUserId(
        invitee.id,
      );
      if (inviteeOnline) {
        socket
          .to(inviteeOnline.socketId)
          .emit('NewChannelInvitation', inviteeUsername);
        socket
          .to(inviteeOnline.socketId)
          .emit('NewChannelInvitationBell', inviteeUsername);
      }
      const ChannelMembers = await this.channelService.getMembers(channelId);
      for (const member of ChannelMembers) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline) {
          socket
            .to(memberOnline.socketId)
            .emit('NewChannelInvitation', inviteeUsername);
          socket
            .to(inviteeOnline.socketId)
            .emit('NewChannelInvitationBell', inviteeUsername);
        }
      }
      return invitee;
    } catch (error) {
      return { error: error.message as string };
    }
  }
  /******************
   *** MatchInvites ***
   *******************/

  @SubscribeMessage('sendMatchInvite')
  async sendGameInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() sendGameInviteDto: SendGameInviteDto,
  ): Promise<Match | ErrorDto> {
    try {
      await this.validateDto(sendGameInviteDto);

      if (sendGameInviteDto.invitedUsername === socket.data.user.username) {
        throw new Error("Can't invite yourself to a game");
      }

      const invitedUser: User | null = await this.userService.findByUsername(
        sendGameInviteDto.invitedUsername,
      );
      if (!invitedUser) {
        throw new Error("User doesn't exists");
      }

      const friendship: Friendship | null = await this.friendshipService.find(
        socket.data.user.id,
        invitedUser.id,
      );
      if (!friendship || friendship.status !== 'ACCEPTED') {
        throw new Error(invitedUser.username + ' is not your friend');
      }

      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(invitedUser.id);

      if (!receiverOnline) {
        throw new Error('User is not online');
      }

      const powerups: Powerup[] = await this.powerupService.findByNames(
        sendGameInviteDto.powerupNames,
      );
      const updatedMatch: Match = await this.matchService.invite(
        sendGameInviteDto.matchId,
        invitedUser.id,
        sendGameInviteDto.goalsToWin,
        powerups,
      );
      socket.emit('matchInviteSent', updatedMatch);
      socket.to(receiverOnline.socketId).emit('matchInvites', updatedMatch);
      return updatedMatch;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('acceptMatchInvite')
  async acceptGameInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<Match | ErrorDto> {
    try {
      this.checkNumberInput(matchId, 'Invalid match id');

      const match: Match | null = await this.matchService.findById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(match.leftUserId);
      if (!receiverOnline) {
        throw new Error('Match creator is not online');
      }

      const updatedMatch: Match = await this.matchService.acceptInvite(matchId);
      socket.emit('matchInvites');
      socket
        .to(receiverOnline.socketId)
        .emit('matchInviteAccepted', updatedMatch);
      return updatedMatch;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('rejectMatchInvite')
  async rejectGameInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<Match | ErrorDto> {
    try {
      this.checkNumberInput(matchId, 'Invalid match id');

      const updatedMatch: Match | null = await this.matchService.rejectInvite(
        matchId,
      );
      if (!updatedMatch) {
        throw new Error('Match not found');
      }

      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(updatedMatch.leftUserId);
      if (!receiverOnline) {
        throw new Error('Match creator is not online');
      }

      socket.emit('matchInvites');
      socket
        .to(receiverOnline.socketId)
        .emit('matchInviteRejected', updatedMatch);
      return updatedMatch;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('cancelMatchInvite')
  async cancelMatchInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<void> {
    this.checkNumberInput(matchId, 'Invalid match id');

    const match: Match = await this.matchService.findById(matchId);
    const receiverOnline: ConnectedUser =
      await this.connectedUserService.findByUserId(match.rightUserId);
    const updatedMatch: Match = await this.matchService.rejectInvite(matchId);

    if (receiverOnline) {
      socket.to(receiverOnline.socketId).emit('matchInvites');
    }
    socket.emit('matchInviteCanceled', updatedMatch);
  }

  @SubscribeMessage('sendMatchInviteViaChat')
  async sendMatchInviteViaChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() againstUserId: number,
  ): Promise<Match | ErrorDto> {
    let match: Match;

    try {
      this.checkNumberInput(againstUserId, 'Invalid user id');

      const againstUser: User = await this.userService.findById(againstUserId);

      if (!againstUser) {
        throw new Error("Cannot invite user because user doesn't exists");
      }

      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(againstUserId);
      if (!receiverOnline) {
        throw new Error(`Opponent ${againstUser.username} is not online`);
      }

      const matchEntity: Prisma.MatchCreateInput = {
        leftUser: { connect: { id: socket.data.user.id } },
        type: 'CUSTOM',
      };

      match = await this.matchService.create(matchEntity);
      match = await this.matchService.invite(match.id, againstUserId, 5, []);

      socket.to(receiverOnline.socketId).emit('matchInvites', match);
      return match;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  /************
   *** Match ***
   *************/
  @SubscribeMessage('hostLeaveMatch')
  async hostLeaveMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<void> {
    const match: Match = await this.matchService.findById(matchId);
    let receiverOnline: ConnectedUser = null;
    if (match.rightUserId) {
      receiverOnline = await this.connectedUserService.findByUserId(
        match.rightUserId,
      );
    }

    await this.matchService.deleteById(match.id);
    if (receiverOnline) {
      socket.to(receiverOnline.socketId).emit('hostLeftMatch');
      socket.to(receiverOnline.socketId).emit('matchInvites');
    }
  }

  @SubscribeMessage('leaveMatch')
  async leaveMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<void> {
    const updatedMatch: Match = await this.matchService.rejectInvite(matchId);
    const receiverOnline: ConnectedUser =
      await this.connectedUserService.findByUserId(updatedMatch.leftUserId);

    if (receiverOnline) {
      socket.to(receiverOnline.socketId).emit('leftMatch', updatedMatch);
    }
  }

  @SubscribeMessage('startMatch')
  async startMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchId: number,
  ): Promise<void> {
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
  async finishedMatch(@ConnectedSocket() socket: Socket): Promise<void> {
    this.updateFriendsOf(socket.data.user.id);
  }

  /******************
   *** Matchmaking ***
   ******************/

  @SubscribeMessage('queueUpForLadder')
  async queueUpForLadder(
    @ConnectedSocket() socket: Socket,
  ): Promise<Matchmaking | ErrorDto> {
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
        connectedUser = await this.connectedUserService.findByUserId(
          findOpponent.userId,
        );
        if (!connectedUser) {
          await this.matchmakingService.deleteByUserId(socket.data.user.id);
          return { error: 'Opponent is not online' };
        }
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

  @SubscribeMessage('setReady')
  async setReady(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchmakingId: number,
  ): Promise<Matchmaking | ErrorDto> {
    let matchmaking: Matchmaking;
    let connectedUser: ConnectedUser;

    try {
      this.checkNumberInput(matchmakingId, 'Invalid matchmaking id');

      matchmaking = await this.matchmakingService.find(matchmakingId);
      if (!matchmaking) {
        return { error: 'Something went wrong while redirecting to the queue' };
      }

      matchmaking = await this.matchmakingService.setUserReady(
        socket.data.user.id,
      );

      if (matchmaking.opponentUserId && matchmaking.opponentReady) {
        connectedUser = await this.connectedUserService.findByUserId(
          matchmaking.userId,
        );
        if (!connectedUser) {
          await this.matchmakingService.deleteByUserId(socket.data.user.id);
          return { error: 'Opponent is not online' };
        }
        socket.to(connectedUser.socketId).emit('readyLadderGame', matchmaking);
      }
      return matchmaking;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('startLadderGame')
  async startLadderMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchmakingId: number,
  ): Promise<Matchmaking | ErrorDto> {
    let matchmaking: Matchmaking;
    let ladderMatch: Match;
    let connectedUser: ConnectedUser;

    try {
      this.checkNumberInput(matchmakingId, 'Invalid matchmaking id');

      matchmaking = await this.matchmakingService.find(matchmakingId);
      if (!matchmaking) {
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
        await this.matchmakingService.deleteByUserId(socket.data.user.id);
        return { error: 'Opponent is not online' };
      }
      await this.matchmakingService.deleteByUserId(matchmaking.userId);

      ladderMatch = await this.matchService.startMatch(ladderMatch.id);
      this.updateFriendsOf(socket.data.user.id);
      this.updateFriendsOf(ladderMatch.rightUserId);
      socket.to(connectedUser.socketId).emit('goToLadderGame', ladderMatch);
      socket.emit('goToLadderGame', ladderMatch);
      return matchmaking;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  /******************
   *** Block users ***
   ******************/

  @SubscribeMessage('blockUser')
  async blockUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() blockUserId: number,
  ): Promise<BlockedUser | ErrorDto> {
    try {
      this.checkNumberInput(blockUserId, 'Invalid matchmaking id');

      const blockedUser: BlockedUser = await this.blockedUserService.block(
        socket.data.user.id,
        blockUserId,
      );
      socket.emit('blockedUsers', blockedUser);
      socket.emit('newChannelMessage');
      socket.emit('friends');
      socket.emit('newDirectMessage');
      return blockedUser;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  @SubscribeMessage('unblockUser')
  async unblockUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() blockUserId: number,
  ): Promise<BlockedUser | ErrorDto> {
    try {
      this.checkNumberInput(blockUserId, 'Invalid matchmaking id');

      const unblockedUser: BlockedUser = await this.blockedUserService.unblock(
        socket.data.user.id,
        blockUserId,
      );
      socket.emit('blockedUsers', unblockedUser);
      socket.emit('newChannelMessage');
      socket.emit('friends');
      socket.emit('newDirectMessage');
      return unblockedUser;
    } catch (error) {
      return { error: error.message as string };
    }
  }

  /****************
   *** Settings ***
   ****************/

  @SubscribeMessage('changeUsername')
  async changeUsername(
    @ConnectedSocket() socket: Socket,
    @MessageBody() newUsername: string,
  ): Promise<User | ErrorDto> {
    try {
      this.checkStringInput(newUsername, 'Invalid username');

      const updatedUser: User = await this.userService.changeUsername(
        socket.data.user.id,
        newUsername,
      );
      //TODO send events that need updating after username is changed
      socket.emit('friends');
      this.updateFriendsOf(updatedUser.id);
      this.updateChannels(updatedUser.id);
      return updatedUser;
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
    this.server.to(connectedUser.socketId).emit('friends');
  }

  private async sendFriendRequestsToClient(
    connectedUser: ConnectedUser,
  ): Promise<void> {
    this.server.to(connectedUser.socketId).emit('friendRequests');
  }

  private async updateFriendsOf(aboutClientId: number): Promise<void> {
    const friends: FriendshipDto[] = await this.friendshipService.getFriends(
      aboutClientId,
    );

    for (const friendEntry of friends) {
      const friendOnline: ConnectedUser =
        await this.connectedUserService.findByUser(friendEntry.friend);
      if (friendOnline) {
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

  private checkStringInput(input: string, errorMessage: string): void {
    if (typeof input !== 'string' || input.trim() === '') {
      throw new Error(errorMessage);
    }
  }

  private checkNumberInput(input: number, errorMessage: string): void {
    if (!Number.isInteger(input) || input <= 0) {
      throw new Error(errorMessage);
    }
  }

  private async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  private async updateChannels(userId: number): Promise<void> {
    const channels: Channel[] = await this.channelService.findByUserId(userId);
    for (const channel of channels) {
      const members: User[] = await this.channelService.getMembers(channel.id);
      for (const member of members) {
        const memberOnline: ConnectedUser =
          await this.connectedUserService.findByUserId(member.id);
        if (memberOnline) {
          this.server
            .to(memberOnline.socketId)
            .emit('UserSignedIn', channel.id);
        }
      }
    }
  }
}
