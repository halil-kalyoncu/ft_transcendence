import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../user/service/user-service/user.service';
import { UserHelperService } from '../../user/service/user-helper/user-helper.service';
import { JwtAuthService } from '../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [UserController],
  //     providers: [
  //       UserService,
  //       UserHelperService,
  //       AuthService,
  //       {
  //         provide: JwtService,
  //         useValue: {},
  //       },
  //       PrismaService,
  //     ],
  //   }).compile();

  //   controller = module.get<UserController>(UserController);
  // });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  it.skip('Not writing tests is a bad practice', () => {});
});
