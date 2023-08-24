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
  Match,
} from '@prisma/client';
import { FriendshipDto } from '../../dto/friendship.dto';
import { ChannelMessageService } from '../../../chat/service/channel-message/channel-message.service';
import { CreateChannelMessageDto, DestroyChannelDto } from '../../dto/create-channel-message.dto';
import { SendGameInviteDto } from '../../../chat/dto/send-game-invite.dto';
import { MatchService } from '../../../match/service/match.service';

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
    private channelMessageService: ChannelMessageService,
    private matchService: MatchService,
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

  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createChannelDto: CreateChannelDto,
  ): Promise<void> {
    try {
      const newChannel = await this.channelService.createUnProtectedChannel(
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


  @SubscribeMessage('DestroyChannel')
  async DestroyChannel(
    socket: Socket,
    destroyChannelDto: DestroyChannelDto,
  ): Promise<void> {
	const { senderId, channelId } = destroyChannelDto;
    const members: User[] = await this.channelService.getMembers(
      channelId
    );
	socket.emit('ChannelDestroy');
    for (const member of members) {
      const memberOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(member.id);
	if ( memberOnline && memberOnline.userId !== senderId) {
		console.log(memberOnline)
		console.log('Online Memeber')
        socket.to(memberOnline.socketId).emit('ChannelDestroy', channelId);
      }
    }
	this.channelService.destroyChannel(channelId);
  }

  
  @SubscribeMessage('SignOutChannel')
  async SignOutChannel(
    socket: Socket,
    destroyChannelDto: DestroyChannelDto,
  ): Promise<void> {
	const { senderId, channelId } = destroyChannelDto;
    const members: User[] = await this.channelService.getMembers(
      channelId
    );
	for (const member of members) {
		const memberOnline: ConnectedUser =
		  await this.connectedUserService.findByUserId(member.id);
	  if ( memberOnline) {
		console.log(memberOnline)
		console.log('Online Memeber')
		  socket.to(memberOnline.socketId).emit('UserSignedOut', channelId);
		}
	  }
  }

  @SubscribeMessage('SignInChannel')
  async SignInChannel(
    socket: Socket,
    channelId: number,
  ): Promise<void> {
    const members: User[] = await this.channelService.getMembers(
      channelId
    );
	for (const member of members) {
		const memberOnline: ConnectedUser =
		  await this.connectedUserService.findByUserId(member.id);
	  if ( memberOnline) {
		console.log(memberOnline)
		console.log('Online Memeber')
		  socket.to(memberOnline.socketId).emit('UserSignedIn', channelId);
		}
	  }
  }
  /**********************
   *** ChannelMessages ***
   ***********************/

  @SubscribeMessage('groupMessages')
  async getGroupMessages(socket: Socket, channelId: number) {
    return await this.channelMessageService.getChannelMessagesforChannel(channelId);
  }

  @SubscribeMessage('sendChannelMessage')
  async sendChannelMessage(
    socket: Socket,
    createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<void> {
	const { senderId, channelId, message } = createChannelMessageDto;
    const newMessage = await this.channelMessageService.createChannelMessageI(
      createChannelMessageDto,
    );

    const members: User[] = await this.channelService.getMembers(
      createChannelMessageDto.channelId,
    );

	socket.emit('newChannelMessage', newMessage);
	console.log('newChannelMessage', newMessage);
    for (const member of members) {
      const memberOnline: ConnectedUser =
        await this.connectedUserService.findByUserId(member.id);
	if ( memberOnline && memberOnline.userId !== senderId) {
        socket.to(memberOnline.socketId).emit('newChannelMessage', newMessage);
      }
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
      return ;
    }
    const receiverOnline: ConnectedUser = await this.connectedUserService.findByUserId(sendGameInviteDto.invitedUserId);
  
    if (!receiverOnline) {
      socket.emit('Error', 'User is not online');
      return;
    }

    console.log(receiverOnline);
    const updatedMatch: Match = await this.matchService.invite(
      sendGameInviteDto.matchId,
      sendGameInviteDto.invitedUserId,
    );
    console.log(updatedMatch);
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
    //remove
    console.log(match.leftUserId + ' ' + receiverOnline.userId);
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
      //remove
      console.log(updatedMatch.leftUserId);
      socket
        .to(receiverOnline.socketId)
        .emit('matchInviteRejected', updatedMatch);
    }
  }

  @SubscribeMessage('hostLeaveMatch')
  async hostLeaveMatch(socket: Socket, matchId: number): Promise<void> {
    const match: Match = await this.matchService.findById(matchId);
    const receiverOnline: ConnectedUser =
      await this.connectedUserService.findByUserId(match.rightUserId);

    if (receiverOnline) {
      console.log('sending hostLeftMatch to ' + receiverOnline.userId);
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
    socket.emit('goToGame', updatedMatch);
    socket.to(receiverOnline.socketId).emit('goToGame', updatedMatch);
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
}
