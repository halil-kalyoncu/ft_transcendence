import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../user/service/user-service/user.service';
import { UserHelperService } from '../../user/service/user-helper/user-helper.service';
import { JwtAuthService } from '../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectedUserService } from '../../chat/service/connected-user/connected-user.service';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        UserHelperService,
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
        ConnectedUserService
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          username: 'mmustermann',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        },
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        }
      ];

      const findAllSpy = jest
        .spyOn(userService, 'findAll')
        .mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(findAllSpy).toHaveBeenCalled();

      findAllSpy.mockRestore();
    });

    it('should return an array with one user', async () => {
      const users: User[] = [
        {
          id: 1,
          username: 'mmustermann',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        }
      ];

      const findAllSpy = jest
        .spyOn(userService, 'findAll')
        .mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(findAllSpy).toHaveBeenCalled();

      findAllSpy.mockRestore();
    });

    it('should return an empty array', async () => {
      const users: User[] = [];

      const findAllSpy = jest
        .spyOn(userService, 'findAll')
        .mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(findAllSpy).toHaveBeenCalled();

      findAllSpy.mockRestore();
    });
  });

  describe('find', () => {
    it('should return a user when username matches', async () => {
      const username = 'mmustermann';
      const user = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        enabled2FA: false,
        secret2FA: null,
      };

      const findByUsernameSpy = jest
        .spyOn(userService, 'findByUsername')
        .mockResolvedValue(user);
      
      const result = await controller.find(username);

      expect(result).toEqual(user);
      expect(findByUsernameSpy).toHaveBeenCalledWith(username);

      findByUsernameSpy.mockRestore();
    });

    it("should return null when username doesn't match", async () => {
      const username = 'mmusterman';

      const findByUsernameSpy = jest
        .spyOn(userService, 'findByUsername')
        .mockResolvedValue(null);
      
      const result = await controller.find(username);

      expect(result).toEqual(null);
      expect(findByUsernameSpy).toHaveBeenCalledWith(username);

      findByUsernameSpy.mockRestore();
    });

  });

  describe('findAllByUsername', () => {
    it('should return an array with two users', async () => {
      const username = 'muster';
      const users: User[] = [
        {
          id: 1,
          username: 'mmustermann',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        },
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        }
      ];

      const findAllByUsernameSpy = jest
        .spyOn(userService, 'findAllByUsername')
        .mockResolvedValue(users);

      const result = await controller.findAllByUsername(username);

      expect(result).toEqual(users);
      expect(findAllByUsernameSpy).toHaveBeenCalledWith(username);

      findAllByUsernameSpy.mockRestore();
    });

    it('should return an array with one user', async () => {
      const username = 'frau';
      const users: User[] = [
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          enabled2FA: false,
          secret2FA: null,
        }
      ];

      const findAllByUsernameSpy = jest
        .spyOn(userService, 'findAllByUsername')
        .mockResolvedValue(users);

      const result = await controller.findAllByUsername(username);

      expect(result).toEqual(users);
      expect(findAllByUsernameSpy).toHaveBeenCalledWith(username);

      findAllByUsernameSpy.mockRestore();
    });

    it('should return an empty array', async () => {
      const username = 'non';
      const users: User[] = [];

      const findAllByUsernameSpy = jest
        .spyOn(userService, 'findAllByUsername')
        .mockResolvedValue(users);

      const result = await controller.findAllByUsername(username);

      expect(result).toEqual(users);
      expect(findAllByUsernameSpy).toHaveBeenCalledWith(username);

      findAllByUsernameSpy.mockRestore();
    });
  });

  describe('uploadAvatar', () => {

  });

  describe('serverAvatar', () => {

  });

  describe('deleteAvatar', () => {

  });
});
