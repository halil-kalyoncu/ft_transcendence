import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipEntity } from './model/friendship/friendship.entity';
import { FriendshipService } from './service/friendship/friendship.service';
import { UserModule } from '../user/user.module';
import { ChatroomEntity } from './model/chatroom/chatroom.entity';
import { DirectMessageEntity } from './model/messages/directMessage.entity';
import { GroupMessageEntity } from './model/messages/groupMessages.entity';
import { MessageEntity } from './model/messages/message.entity';
import { UserChatroomEntity } from './model/chatroom/user-chatroom.entity';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { AuthModule } from '../auth/auth.module';
import { ConnectedUserEntity } from './model/connected-user/connected-user.entity';
import { ChatController } from './controller/chat/chat.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([
      FriendshipEntity,
      ChatroomEntity,
      UserChatroomEntity,
      DirectMessageEntity,
      GroupMessageEntity,
      MessageEntity,
      ConnectedUserEntity,
    ]),
  ],
  providers: [ChatGateway, FriendshipService, ConnectedUserService],
  controllers: [ChatController],
})
export class ChatModule {}
