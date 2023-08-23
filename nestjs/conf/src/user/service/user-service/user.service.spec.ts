import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {},
        },
        PrismaService,
        ConnectedUserService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
