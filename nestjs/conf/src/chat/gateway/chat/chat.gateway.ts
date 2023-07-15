import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
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
import { UserI } from '../../../user/model/user.interface';
import { UserService } from '../../../user/service/user-service/user.service';
import { FriendshipI } from '../../model/friendship/friendship.interface';
import { ConnectedUserI } from '../../model/connected-user/connected-user.interface';
import { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface';
import { FriendshipStatus } from '../../model/friendship/friendship.entity';

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
    private connectedUserService: ConnectedUserService,
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
      const user: UserI = await this.userService.findById(decodedToken.user.id);
      if (!user) {
        return this.disconnectUnauthorized(socket);
      }
      //save user data in socket
      socket.data.user = user;

      //save user in connectedUsers
      const connectedUser = await this.connectedUserService.create({
        socketId: socket.id,
        user,
      });

      this.updateFriendsOf(user.id);
      this.sendFriendsToClient(connectedUser);
      this.sendFriendRequestsToClient(connectedUser);
    } catch {
      this.disconnectUnauthorized(socket);
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    this.updateFriendsOf(socket.data.user.id);
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    socket: Socket,
    receiverUsername: string,
  ): Promise<FriendshipEntryI | { error: string }> {
    try {
      const receiver: UserI = await this.userService.findByUsername(
        receiverUsername,
      );
      if (!receiver) {
        throw new Error('User not found');
      } else if (socket.data.user.username === receiverUsername) {
        throw new Error("Can't add yourself");
      }

      const checkFriendship: FriendshipI = await this.friendshipService.findOne(
        socket.data.user.id,
        receiver.id,
      );
      if (checkFriendship) {
        if (checkFriendship.status === FriendshipStatus.Pending) {
          throw new Error('Already send a request');
        } else if (checkFriendship.status === FriendshipStatus.Accepted) {
          throw new Error('Already friends');
        } else if (checkFriendship.status === FriendshipStatus.Rejected) {
          await this.friendshipService.remove(checkFriendship.id);
        }
      }

      const friendship: FriendshipI = await this.friendshipService.create({
        sender: socket.data.user,
        receiver: receiver,
      });

      const receiverOnline: ConnectedUserI =
        await this.connectedUserService.findByUser(receiver);
      if (!!receiverOnline) {
        this.sendFriendRequestsToClient(receiverOnline);
      }
      return { id: friendship.id, friend: friendship.receiver };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    socket: Socket,
    friendshipId: number,
  ): Promise<void> {
    const friendship: FriendshipI =
      await this.friendshipService.acceptFriendshipRequest(friendshipId);
    const senderOnline: ConnectedUserI =
      await this.connectedUserService.findByUser(friendship.sender);
    const receiverOnline: ConnectedUserI =
      await this.connectedUserService.findByUser(friendship.receiver);
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
    const friendship: FriendshipI =
      await this.friendshipService.rejectFriendshipRequest(friendshipId);
    const senderOnline: ConnectedUserI =
      await this.connectedUserService.findByUser(friendship.sender);
    const receiverOnline: ConnectedUserI =
      await this.connectedUserService.findByUser(friendship.receiver);
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
      const senderOnline: ConnectedUserI =
        await this.connectedUserService.findByUser(friendship.sender);
      const receiverOnline: ConnectedUserI =
        await this.connectedUserService.findByUser(friendship.receiver);

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

  private async sendFriendsToClient(
    connectedUser: ConnectedUserI,
  ): Promise<void> {
    const friends: FriendshipEntryI[] = await this.friendshipService.getFriends(
      connectedUser.user.id,
    );
    this.server.to(connectedUser.socketId).emit('friends', friends);
  }

  private async sendFriendRequestsToClient(
    connectedUser: ConnectedUserI,
  ): Promise<void> {
    const requests: FriendshipEntryI[] =
      await this.friendshipService.getFriendRequests(connectedUser.user.id);
    this.server.to(connectedUser.socketId).emit('friendRequests', requests);
  }

  private async updateFriendsOf(aboutClientId: number): Promise<void> {
    const friends: FriendshipEntryI[] = await this.friendshipService.getFriends(
      aboutClientId,
    );

    for (const friendEntry of friends) {
      const friendOnline: ConnectedUserI =
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
