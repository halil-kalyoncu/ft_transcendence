import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';
import { Prisma, User } from '@prisma/client';
import * as fs from 'fs';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let jwtAuthService: JwtAuthService;
  let connectedUserService: ConnectedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
        ConnectedUserService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);
    connectedUserService =
      module.get<ConnectedUserService>(ConnectedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should create a new user and generate a JWT', async () => {
      const input: Prisma.UserCreateInput = {
        username: 'mmustermann',
      };
      const createdUser: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const connectedUser = {
        id: 1,
        socketId: 'socketId',
        userId: 1,
      };
      const token = 'jwtToken';

      const findByUsernameSpy = jest
        .spyOn(service, 'findByUsername')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(createdUser);
      const findByUserIdSpy = jest
        .spyOn(connectedUserService, 'findByUserId')
        .mockResolvedValue(connectedUser);
      const generateJwtSpy = jest
        .spyOn(jwtAuthService, 'generateJwt')
        .mockResolvedValue(token);

      const result = await service.login(input);

      expect(result).toBe(token);
      expect(findByUsernameSpy).toHaveBeenCalledWith(input.username);
      expect(createSpy).toHaveBeenCalledWith(input);
      expect(findByUserIdSpy).not.toHaveBeenCalled();
      expect(generateJwtSpy).toHaveBeenCalledWith(createdUser);

      findByUsernameSpy.mockRestore();
      createSpy.mockRestore();
      findByUserIdSpy.mockRestore();
      generateJwtSpy.mockRestore();
    });

    it('should find the user and generate a JWT', async () => {
      const input: Prisma.UserCreateInput = {
        username: 'mmustermann',
      };
      const foundUser: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const token = 'jwtToken';

      const findByUsernameSpy = jest
        .spyOn(service, 'findByUsername')
        .mockResolvedValue(foundUser);
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(foundUser);
      const findByUserIdSpy = jest
        .spyOn(connectedUserService, 'findByUserId')
        .mockResolvedValue(null);
      const generateJwtSpy = jest
        .spyOn(jwtAuthService, 'generateJwt')
        .mockResolvedValue(token);

      const result = await service.login(input);

      expect(result).toBe(token);
      expect(findByUsernameSpy).toHaveBeenCalledWith(input.username);
      expect(createSpy).not.toHaveBeenCalled();
      expect(findByUserIdSpy).toHaveBeenCalledWith(foundUser.id);
      expect(generateJwtSpy).toHaveBeenCalledWith(foundUser);

      findByUsernameSpy.mockRestore();
      createSpy.mockRestore();
      findByUserIdSpy.mockRestore();
      generateJwtSpy.mockRestore();
    });

    it('should throw an error when user is already logged in', async () => {
      const input: Prisma.UserCreateInput = {
        username: 'mmustermann',
      };
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const connectedUser = {
        id: 1,
        socketId: 'socketId',
        userId: 1,
      };
      const token = 'jwtToken';

      const findByUsernameSpy = jest
        .spyOn(service, 'findByUsername')
        .mockResolvedValue(user);
      const createSpy = jest.spyOn(service, 'create').mockResolvedValue(user);
      const findByUserIdSpy = jest
        .spyOn(connectedUserService, 'findByUserId')
        .mockResolvedValue(connectedUser);
      const generateJwtSpy = jest
        .spyOn(jwtAuthService, 'generateJwt')
        .mockResolvedValue(token);

      try {
        await service.login(input);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(`User ${user.username} is already logged in`);
      }

      expect(findByUsernameSpy).toHaveBeenCalledWith(input.username);
      expect(createSpy).not.toHaveBeenCalled();
      expect(findByUserIdSpy).toHaveBeenCalledWith(user.id);
      expect(generateJwtSpy).not.toHaveBeenCalled();

      findByUsernameSpy.mockRestore();
      createSpy.mockRestore();
      findByUserIdSpy.mockRestore();
      generateJwtSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const newUser: Prisma.UserCreateInput = {
        username: 'mmustermann',
      };
      const expectedResult: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const createSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.create(newUser);

      expect(result).toEqual(expectedResult);
      expect(createSpy).toHaveBeenCalledWith({
        data: newUser,
      });

      createSpy.mockRestore();
    });

    it('should throw an error when username is already in use', async () => {
      const newUser: Prisma.UserCreateInput = {
        username: 'mmustermann',
      };
      const expectedError = new Error('Username is already in use');

      const createSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(expectedError);

      try {
        const result = await service.create(newUser);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
      expect(createSpy).toHaveBeenCalledWith({
        data: newUser,
      });

      createSpy.mockRestore();
    });

    it('should throw an error when newUser is invalid', async () => {
      const newUser = null;
      const expectedError = new Error();

      const createSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(expectedError);

      try {
        const result = await service.create(newUser);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
      expect(createSpy).toHaveBeenCalledWith({
        data: newUser,
      });

      createSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userId = 1;
      const user: User = {
        id: userId,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user);

      const result = await service.findById(userId);

      expect(result).toEqual(user);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: userId },
        include: { blockedUsers: true },
      });

      findUniqueSpy.mockRestore();
    });

    it('should return null when user is not found', async () => {
      const userId = 4242;

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(result).toBeNull;
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: userId },
        include: { blockedUsers: true },
      });

      findUniqueSpy.mockRestore();
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'mmustermann';
      const user: User = {
        id: 1,
        username,
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user);

      const result = await service.findByUsername(username);

      expect(result).toEqual(user);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { username },
      });

      findUniqueSpy.mockRestore();
    });

    it('should return null when user is not found', async () => {
      const username = 'non';

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.findByUsername(username);

      expect(result).toBeNull;
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { username },
      });

      findUniqueSpy.mockRestore();
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const users: User[] = [
        {
          id: 1,
          username: 'mmustermann',
          avatarId: null,
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(findManySpy).toHaveBeenCalledWith();

      findManySpy.mockRestore();
    });

    it('should return no users', async () => {
      const users: User[] = [
        {
          id: 1,
          username: 'mmustermann',
          avatarId: null,
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(findManySpy).toHaveBeenCalledWith();

      findManySpy.mockRestore();
    });

    it('should return one user', async () => {
      const users: User[] = [];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(findManySpy).toHaveBeenCalledWith();

      findManySpy.mockRestore();
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
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(users);

      const result = await service.findAllByUsername(username);

      expect(result).toEqual(users);
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          username: {
            contains: username,
          },
        },
      });

      findManySpy.mockRestore();
    });

    it('should return an array with one user', async () => {
      const username = 'frau';
      const expectedResult: User[] = [
        {
          id: 2,
          username: 'mmusterfrau',
          avatarId: null,
          ladderLevel: 1000,
          enabled2FA: false,
          secret2FA: null,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(expectedResult);

      const result = await service.findAllByUsername(username);

      expect(result).toEqual(expectedResult);
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          username: {
            contains: username,
          },
        },
      });

      findManySpy.mockRestore();
    });

    it('should return an empty array', async () => {
      const username = 'non';
      const expectedResult = [];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(expectedResult);

      const result = await service.findAllByUsername(username);

      expect(result).toEqual(expectedResult);
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          username: {
            contains: username,
          },
        },
      });

      findManySpy.mockRestore();
    });
  });

  describe('uploadAvatar', () => {
    it('should upload an avatar and update the user', async () => {
      const userId = 1;
      const file = { filename: 'abc-123.png' } as Express.Multer.File;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user);
      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, avatarId: file.filename });
      const unlinkSyncSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});

      const result = await service.uploadAvatar(file, userId);

      expect(result).toEqual({ ...user, avatarId: file.filename });
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarId: file.filename },
      });
      expect(unlinkSyncSpy).not.toHaveBeenCalled();

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });

    it('should upload an avatar and delete the existing one', async () => {
      const userId = 1;
      const file = { filename: 'def-456.png' } as Express.Multer.File;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: 'abc-123.png',
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user);

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, avatarId: file.filename });

      const unlinkSyncSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});

      const result = await service.uploadAvatar(file, userId);

      expect(result).toEqual({ ...user, avatarId: file.filename });
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarId: file.filename },
      });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });

    it('should throw an error when user is not found', async () => {
      const userId = 4242;
      const file = { filename: 'abc-123.png' } as Express.Multer.File;

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(null);

      try {
        await service.uploadAvatar(file, userId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User not found');
      }

      findByIdSpy.mockRestore();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete the avatar and update the user', async () => {
      const userId = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: 'abc-123.png',
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user);
      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, avatarId: null });
      const unlinkSyncSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});

      const result = await service.deleteAvatar(userId);

      expect(result).toEqual({ ...user, avatarId: null });
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarId: null },
      });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });

    it('should return the user if no avatar is uploaded', async () => {
      const userId = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user);
      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(user);
      const unlinkSyncSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});

      const result = await service.deleteAvatar(userId);

      expect(result).toEqual(user);
      expect(findByIdSpy).toHaveBeenCalledWith(userId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarId: null },
      });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });

    it('should throw an error when user is not found', async () => {
      const userId = 4242;

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(null);

      try {
        await service.deleteAvatar(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User not found');
      }

      findByIdSpy.mockRestore();
    });
  });

  describe('setTwoFactorAuthSecret', () => {
    it('should set the two-factor authentication secret', async () => {
      const userId = 1;
      const secret = 'mysecret';
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, secret2FA: secret });

      const result = await service.setTwoFactorAuthSecret(userId, secret);

      expect(result).toEqual({ ...user, secret2FA: secret });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { secret2FA: secret },
      });

      updateSpy.mockRestore();
    });

    it('should throw an error when user is not found', async () => {
      const userId = 4242;
      const secret = 'mysecret';

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValue(new Error());

      try {
        await service.setTwoFactorAuthSecret(userId, secret);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

      updateSpy.mockRestore();
    });
  });

  describe('turnOnTwoFactorAuth', () => {
    it('should set the two-factor flag to true', async () => {
      const userId = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, enabled2FA: true });

      const result = await service.turnOnTwoFactorAuth(userId);

      expect(result).toEqual({ ...user, enabled2FA: true });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { enabled2FA: true },
      });

      updateSpy.mockRestore();
    });

    it('should return user if flag is already set to true', async () => {
      const userId = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: true,
        secret2FA: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(user);

      const result = await service.turnOnTwoFactorAuth(userId);

      expect(result).toEqual(user);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { enabled2FA: true },
      });

      updateSpy.mockRestore();
    });

    it('should throw an error when user is not found', async () => {
      const userId = 4242;

      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockRejectedValue(new Error());

      try {
        await service.turnOnTwoFactorAuth(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

      updateSpy.mockRestore();
    });
  });
});
