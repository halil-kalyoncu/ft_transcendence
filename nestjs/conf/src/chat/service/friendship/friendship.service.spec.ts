import { Test, TestingModule } from '@nestjs/testing';
import { FriendshipService } from './friendship.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../connected-user/connected-user.service';

describe('FriendshipService', () => {
  let service: FriendshipService;

  it.skip('Not writing tests is a bad practice', () => {});

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       FriendshipService,
  //       { provide: PrismaService, useValue: PrismaService.getInstance() },
  //       ConnectedUserService,
  //     ],
  //   }).compile();

  //   service = module.get<FriendshipService>(FriendshipService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
