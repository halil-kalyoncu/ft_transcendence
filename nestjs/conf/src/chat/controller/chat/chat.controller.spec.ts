import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { FriendshipService } from '../../../chat/service/friendship/friendship.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendshipEntity } from '../../../chat/model/friendship/friendship.entity';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { ConnectedUserEntity } from '../../../chat/model/connected-user/connected-user.entity';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatController,
        FriendshipService,
        {
          provide: getRepositoryToken(FriendshipEntity),
          useValue: {},
        },
        ConnectedUserService,
        {
          provide: getRepositoryToken(ConnectedUserEntity),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
