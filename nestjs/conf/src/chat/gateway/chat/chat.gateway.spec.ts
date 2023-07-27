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
import { CreateChannelDto } from '../../dto/channel.dto';
import { ChannelMessageService } from '../../../chat/service/channel-message/channel-message.service';
import { Socket } from 'socket.io';

describe('ChatGateaway', () => {
  let gateway: ChatGateway;
  let mockChannelService = { createChannel: jest.fn() };
  let mockSocket = { emit: jest.fn() } as any as Socket;

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
        ChannelMessageService,
        {
          provide: ChannelService,
          useValue: mockChannelService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        { provide: PrismaService, useValue: PrismaService.getInstance() }, // Use getInstance here
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should create channel and emit channelCreated', async () => {
    const createChannelDto: CreateChannelDto = {
      userId: 1,
      name: 'Test Channel',
      password: 'Test Password',
      channelVisibility: 'PUBLIC',
    };

    mockChannelService.createChannel.mockResolvedValue({});
    await gateway.handleCreateChannel(mockSocket, createChannelDto);
    expect(mockChannelService.createChannel).toHaveBeenCalledWith(
      createChannelDto,
    );
    expect(mockSocket.emit).toHaveBeenCalledWith('channelCreated', true);
  });

  it('should handle errors and emit error event', async () => {
    const createChannelDto: CreateChannelDto = {
      userId: 1,
      name: 'Test Channel',
      password: 'Test Password',
      channelVisibility: 'PUBLIC',
    };
    const errorMessage = 'Test Error';
    mockChannelService.createChannel.mockRejectedValue(new Error(errorMessage));

    await gateway.handleCreateChannel(mockSocket, createChannelDto);

    expect(mockChannelService.createChannel).toHaveBeenCalledWith(
      createChannelDto,
    );
    expect(mockSocket.emit).toHaveBeenCalledWith('error', errorMessage);
  });
});
