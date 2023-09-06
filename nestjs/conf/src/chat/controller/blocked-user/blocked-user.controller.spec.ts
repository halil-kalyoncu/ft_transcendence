import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUserController } from './blocked-user.controller';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('BlockedUserController', () => {
  let controller: BlockedUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockedUserService,
        UserService,
        JwtAuthService,
        JwtService,
        ConnectedUserService,
        PrismaService,
      ],
      controllers: [BlockedUserController],
    }).compile();

    controller = module.get<BlockedUserController>(BlockedUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
