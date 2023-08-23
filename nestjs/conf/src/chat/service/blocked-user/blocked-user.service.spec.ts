import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUserService } from './blocked-user.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';

describe('BlockedUserService', () => {
  let service: BlockedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockedUserService,
        UserService,
        JwtAuthService,
        JwtService,
        PrismaService,
      ],
    }).compile();

    service = module.get<BlockedUserService>(BlockedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});