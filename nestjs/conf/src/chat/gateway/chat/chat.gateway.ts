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

@WebSocketGateway({
  cors: {
    origin: [
      'https://hoppscotch.io',
      'http://localhost:3000',
      'http://localhost:4200',
    ],
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
    private connectedUserSerice: ConnectedUserService,
  ) {}

  async onModuleInit() {
    await this.connectedUserSerice.deleteAll();
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization,
      );
      const user: UserI = await this.userService.findById(decodedToken.user.id);
    } catch {
      return this.disconnectUnauthorized(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserSerice.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnectUnauthorized(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
  }

  @SubscribeMessage('addFriend')
  async addFriend(socket: Socket, receiverUsername: string) {
    const receiver = await this.userService.findByUsername(receiverUsername);
    return await this.friendshipService.create({
      sender: socket.data.user,
      receiver: receiver,
    });
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
