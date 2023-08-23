import { Module, forwardRef } from '@nestjs/common';
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
import { MatchService } from '../match/service/match.service';
import { FriendshipController } from './controller/friendship/friendship.controller';
import { ChannelController } from './controller/channel/channel.controller';
import { ChannelMemberService } from './service/channel-member/channel-member.service';
import { BlockedUserService } from './service/blocked-user/blocked-user.service';
import { BlockedUserController } from './controller/blocked-user/blocked-user.controller';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => UserModule)],
  providers: [
    ChatGateway,
    FriendshipService,
    ChannelService,
    ConnectedUserService,
    DirectMessageService,
    MessageService,
    ChannelMessageService,
    MatchService,
    ChannelMemberService,
    BlockedUserService,
  ],
  controllers: [
    DirectMessageController,
    FriendshipController,
    ChannelController,
    BlockedUserController,
  ],
  exports: [FriendshipService, ConnectedUserService],
})
export class ChatModule {}
