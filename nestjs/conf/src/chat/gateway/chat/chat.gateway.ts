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
import { AuthService } from '../../../auth/service/auth.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { FriendshipService } from '../../../chat/service/friendship/friendship.service';
import { ChannelService } from '../../../chat/service/channel/channel.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { DirectMessageService } from '../../../chat/service/direct-message/direct-message.service';
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
  DirectMessage,
  Friendship,
  FriendshipStatus,
  User,
} from '@prisma/client';
import { FriendshipDto } from '../../dto/friendship.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4200'],
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private friendshipService: FriendshipService,
    private channelService: ChannelService,
    private connectedUserService: ConnectedUserService,
    private directMessageService: DirectMessageService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connectedUserService.deleteAll();
  }

  async handleConnection(socket: Socket, ...args: any[]): Promise<void> {
    try {
      //Authorization has the format Bearer <access_token>, remove Bearer to verify the token
      const tokenArray: string[] =
        socket.handshake.headers.authorization.split(' ');
      const decodedToken = await this.authService.verifyJwt(tokenArray[1]);
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
      
      const connectedUser = await this.connectedUserService.findByUser(socket.data.user);
  
      if (connectedUser) {
        await this.connectedUserService.deleteBySocketId(socket.id);
      }
    }
    socket.disconnect();
  }

  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    socket: Socket,
    receiverUsername: string,
  ): Promise<FriendshipDto | { error: string }> {
    try {
      const receiver: User = await this.userService.findByUsername(
        receiverUsername,
      );
      if (!receiver) {
        throw new Error('User not found');
      } else if (socket.data.user.username === receiverUsername) {
        throw new Error("Can't add yourself");
      }

      const checkFriendship: Friendship = await this.friendshipService.findOne(
        socket.data.user.id,
        receiver.id,
      );
      if (checkFriendship) {
        if (checkFriendship.status === FriendshipStatus.PENDING) {
          throw new Error('Already send a request');
        } else if (checkFriendship.status === FriendshipStatus.ACCEPTED) {
          throw new Error('Already friends');
        } else if (checkFriendship.status === FriendshipStatus.REJECTED) {
          await this.friendshipService.remove(checkFriendship.id);
        }
      }

      const friendship: Friendship = await this.friendshipService.create({
        sender: { connect: { id: socket.data.user.id } },
        receiver: { connect: { id: receiver.id } },
      });

      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUser(receiver);
      if (!!receiverOnline) {
        this.sendFriendRequestsToClient(receiverOnline);
      }
      return { id: friendship.id, friend: receiver, isOnline: false };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    socket: Socket,
    friendshipId: number,
  ): Promise<void> {
    const friendship: Friendship =
      await this.friendshipService.acceptFriendshipRequest(friendshipId);
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
  }

  @SubscribeMessage('rejectFriendRequest')
  async rejectFriendRequest(
    socket: Socket,
    friendshipId: number,
  ): Promise<void> {
    const friendship: Friendship =
      await this.friendshipService.rejectFriendshipRequest(friendshipId);
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
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(
    socket: Socket,
    friendshipId: number,
  ): Promise<void | { error: string }> {
    try {
      const friendship = await this.friendshipService.getOne(friendshipId);
      if (!friendship) {
        throw new Error('Something went wrong during removing from friends');
      }
      const senderOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(friendship.senderId);
      const receiverOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(friendship.receiverId);

      await this.friendshipService.remove(friendshipId);
      if (!!senderOnline) {
        this.sendFriendsToClient(senderOnline);
      }
      if (!!receiverOnline) {
        this.sendFriendsToClient(receiverOnline);
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('directMessages')
  async getDirectMessages(socket: Socket, userId2: number) {
    const messages = await this.directMessageService.getConversation(
      socket.data.user.id,
      userId2,
    );
    return messages;
  }

  @SubscribeMessage('sendDirectMessage')
  async sendDirectMessage(
    socket: Socket,
    createDirectMessageDto: CreateDirectMessageDto,
  ): Promise<void> {
    await this.directMessageService.create(createDirectMessageDto);
  }

  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createChannelDto: CreateChannelDto,
  ): Promise<void> {
    try {
      const newChannel = await this.channelService.createChannel(
        createChannelDto,
      );
      socket.emit('channelCreated', true);
    } catch (error) {
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('setChannelPassword')
  async handleSetPassword(
    socket: Socket,
    @MessageBody() setPasswordDto: SetPasswordDto,
  ): Promise<void> {
    try {
      const channel = await this.channelService.setPassword(setPasswordDto);
      socket.emit('passwordSet', channel);
    } catch (error) {
      socket.emit('error', error.message);
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
      const membership = await this.channelService.joinChannel(
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
      const membership = await this.channelService.leaveChannel(
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
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<void> {
    try {
      const membership = await this.channelService.makeAdmin(adminActionDto);
      socket.emit('madeAdmin', membership);
    } catch (error) {
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('kickChannelMember')
  async handleKickChannelMember(
    socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<void> {
    try {
      const membership = await this.channelService.kickChannelMember(
        adminActionDto,
      );
      socket.emit('memberKicked', membership);
    } catch (error) {
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('banChannelMember')
  async handleBanChannelMember(
    socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<void> {
    try {
      const membership = await this.channelService.banChannelMember(
        adminActionDto,
      );
      socket.emit('memberBanned', membership);
    } catch (error) {
      socket.emit('error', error.message);
    }
  }

  @SubscribeMessage('muteChannelMember')
  async handleMuteChannelMember(
    socket: Socket,
    @MessageBody() adminActionDto: AdminActionDto,
  ): Promise<void> {
    try {
      const membership = await this.channelService.muteChannelMember(
        adminActionDto,
      );
      socket.emit('memberMuted', membership);
    } catch (error) {
      socket.emit('error', error.message);
    }
  }

  private async sendFriendsToClient(
    connectedUser: ConnectedUser,
  ): Promise<void> {
    const friends: FriendshipDto[] = await this.friendshipService.getFriends(
      connectedUser.userId,
    );
    this.server.to(connectedUser.socketId).emit('friends', friends);
  }

  private async sendFriendRequestsToClient(
    connectedUser: ConnectedUser,
  ): Promise<void> {
    const requests: FriendshipDto[] =
      await this.friendshipService.getFriendRequests(connectedUser.userId);
    this.server.to(connectedUser.socketId).emit('friendRequests', requests);
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
}
