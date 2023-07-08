import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { UserService } from '../../../user/service/user-service/user.service';
import { FriendshipService } from '../../../chat/service/friendship/friendship.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { AuthService } from '../../../auth/service/auth.service';
import { UserEntity } from '../../../user/model/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { FriendshipEntity } from '../../../chat/model/friendship/friendship.entity';
import { ConnectedUserEntity } from '../../../chat/model/connected-user/connected-user.entity';

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
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {}, 
        },
        {
          provide: getRepositoryToken(FriendshipEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ConnectedUserEntity),
          useValue: {},
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
