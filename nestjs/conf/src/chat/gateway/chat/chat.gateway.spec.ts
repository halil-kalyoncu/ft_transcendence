import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { UserService } from '../../../user/service/user-service/user.service';
import { FriendshipService } from '../../../chat/service/friendship/friendship.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { ChannelService } from '../../../chat/service/channel/channel.service';
import { AuthService } from '../../../auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { DirectMessageService } from '../../../chat/service/direct-message/direct-message.service';
import { MessageService } from '../../../chat/service/message/message.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        UserService,
        FriendshipService,
        ConnectedUserService,
        AuthService,
        DirectMessageService,
        MessageService,
        ChannelService,
        {
          provide: JwtService,
          useValue: {},
        },
        PrismaService,
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
