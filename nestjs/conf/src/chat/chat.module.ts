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
import { MatchService } from '../match/service/match.service';
import { FriendshipController } from './controller/friendship/friendship.controller';
import { ChannelController } from './controller/channel/channel.controller';
import { ChannelMemberService } from './service/channel-member/channel-member.service';
import { ChannelMessageController } from './controller/channel-message/channel-message.controller';
import { ChannelMessageReadStatusController } from './controller/channel-message-read-status/channel-message-read-status.controller';
import { ChannelMessageReadStatusService } from './service/channel-message-read-status/channel-message-read-status.service';
import { ChannelInvitationsController } from './controller/channel-invitations/channel-invitations.controller';
import { ChannelInvitationsService } from './service/channel-invitations/channel-invitations.service';

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
    MatchService,
    ChannelMemberService,
    ChannelMessageReadStatusService,
    ChannelInvitationsService,
  ],
  controllers: [DirectMessageController, FriendshipController, ChannelController, ChannelMessageController, ChannelMessageReadStatusController, ChannelInvitationsController],
  exports: [FriendshipService, ConnectedUserService],
})
export class ChatModule {}
