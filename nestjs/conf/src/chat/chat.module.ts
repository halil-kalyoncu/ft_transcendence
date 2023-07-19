import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { FriendshipService } from './service/friendship/friendship.service';
import { UserModule } from '../user/user.module';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { AuthModule } from '../auth/auth.module';
import { DirectMessageService } from './service/direct-message/direct-message.service';
import { MessageService } from './service/message/message.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    ChatGateway,
    FriendshipService,
    ConnectedUserService,
    DirectMessageService,
    MessageService,
  ],
  controllers: [],
  exports: [FriendshipService, ConnectedUserService],
})
export class ChatModule {}
