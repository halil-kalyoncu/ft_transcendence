import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { FriendshipService } from './service/friendship/friendship.service';
import { UserModule } from '../user/user.module';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { ChannelService } from './service/channel/channel.service';
import { AuthModule } from '../auth/auth.module';
import { DirectMessageService } from './service/direct-message/direct-message.service';
import { MessageService } from './service/message/message.service';
import { ChannelMessageService } from './service/channel-message/channel-message.service';
import { DirectMessageController } from './controller/direct-message/direct-message.controller';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    ChatGateway,
    FriendshipService,
    ChannelService,
    ConnectedUserService,
    DirectMessageService,
    MessageService,
    ChannelMessageService,
  ],
  controllers: [DirectMessageController],
  exports: [FriendshipService, ConnectedUserService],
})
export class ChatModule {}
