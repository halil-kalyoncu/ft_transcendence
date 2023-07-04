import { UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from 'src/chat/service/friendship/friendship.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200']}})
export class ChatGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private friendshipService: FriendshipService
  ) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    const user: UserI = await this.userService.findByUsername("hkalyonc");
    if (!user) {
      return this.disconnect(socket);
    }
    socket.data.user = user;
  }

  @SubscribeMessage('addFriend')
  async addFriend(socket: Socket, receiverUsername: string) {
    const receiver = await this.userService.findByUsername(receiverUsername);
    return await this.friendshipService.create({sender: socket.data.user, receiver: receiver});
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

}
