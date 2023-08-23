import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {});

  describe('create', () => {
    it('should create user', async () => {
      const newUser = {
        username: 'mmustermann',
      };
      const expectedResult = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
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
      const newUser = {
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
      const user = {
        id: userId,
        username: 'mmustermann',
        avatarId: null,
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
      const user = {
        id: 1,
        username,
        avatarId: null,
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

  describe('findAll', () => {});

  describe('findAllByUsername', () => {});

  describe('uploadAvatar', () => {});

  describe('deleteAvatar', () => {});

  describe('setTwoFactorAuthSecret', () => {});

  describe('turnOnTwoFactorAuth', () => {});
});
