import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipService } from './friendship.service';
import { FriendshipEntity } from '../../../chat/model/friendship/friendship.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { ConnectedUserEntity } from '../../../chat/model/connected-user/connected-user.entity';

describe('FriendshipService', () => {
  let service: FriendshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<FriendshipService>(FriendshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
