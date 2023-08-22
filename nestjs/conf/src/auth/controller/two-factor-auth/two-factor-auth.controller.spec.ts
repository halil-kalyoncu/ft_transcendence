import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from '../../service/two-factor-auth/two-factor-auth.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { JwtAuthService } from '../../service/jwt-auth/jtw-auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('TwoFactorAuthController', () => {
  let controller: TwoFactorAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorAuthController],
      providers: [
        TwoFactorAuthService,
        UserService,
        JwtAuthService,
        PrismaService,
        JwtService
      ],
    }).compile();

    controller = module.get<TwoFactorAuthController>(TwoFactorAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
