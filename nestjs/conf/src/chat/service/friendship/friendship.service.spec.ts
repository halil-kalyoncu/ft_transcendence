import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipService } from './friendship.service';
import { FriendshipEntity } from '../../../chat/model/friendship/friendship.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

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
      ],
    }).compile();

    service = module.get<FriendshipService>(FriendshipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
