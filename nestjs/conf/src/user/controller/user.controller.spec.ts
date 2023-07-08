import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../user/service/user-service/user.service';
import { UserHelperService } from '../../user/service/user-helper/user-helper.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../user/model/user.entity';
import { AuthService } from '../../auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        UserHelperService,
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
