import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';
import { UserService } from '../../user/service/user-service/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthService } from '../../auth/service/jwt-auth/jtw-auth.service';
import { ConnectedUserService } from '../../chat/service/connected-user/connected-user.service';
import { JwtService } from '@nestjs/jwt';
import { Matchmaking, User } from '@prisma/client';

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        UserService,
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {},
        },
        ConnectedUserService,
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should return matchmaking entry if id matches', async () => {
      const id: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 2,
        opponentUserId: 1,
        userReady: false,
        opponentReady: false,
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.matchmaking, 'findUnique')
        .mockResolvedValue(matchmaking);

      const result = await service.find(id);

      expect(result).toBe(matchmaking);
      expect(findUniqueSpy).toBeCalledWith({
        where: { id },
      });

      findUniqueSpy.mockRestore();
    });

    it("should return null if id doesn't match", async () => {
      const id: number = 4242;

      const findUniqueSpy = jest
        .spyOn(prismaService.matchmaking, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.find(id);

      expect(result).toBe(null);
      expect(findUniqueSpy).toBeCalledWith({
        where: { id },
      });

      findUniqueSpy.mockRestore();
    });
  });

  describe('getByUserId', () => {
    it('should return matchmaking entry if userId matches', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(matchmaking);

      const result = await service.getByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { opponentUserId: userId }],
        },
      });

      findFirstSpy.mockRestore();
    });

    it('should return matchmaking entry if userId matches with opponentUserId', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 2,
        opponentUserId: 1,
        userReady: false,
        opponentReady: false,
      };

      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(matchmaking);

      const result = await service.getByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { opponentUserId: userId }],
        },
      });

      findFirstSpy.mockRestore();
    });

    it("should return null if user has no matchmaking entry or user doesn't exists", async () => {
      const userId: number = 4242;

      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.getByUserId(userId);

      expect(result).toBe(null);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          OR: [{ userId }, { opponentUserId: userId }],
        },
      });

      findFirstSpy.mockRestore();
    });
  });

  describe('findOpponent', () => {
    it('should update opponentUserId and return entry if ladderLevel of both users falls within a range of -+50 from each other', async () => {
      const userId: number = 2;
      const user: User = {
        id: 2,
        username: 'mmusterfrau',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const lowerRange = user.ladderLevel - 50;
      const upperRange = user.ladderLevel + 50;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: null,
        userReady: false,
        opponentReady: false,
      };

      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(user);
      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(matchmaking);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, opponentUserId: user.id });

      const result = await service.findOpponent(userId);

      expect(result).toStrictEqual({ ...matchmaking, opponentUserId: user.id });
      expect(findByIdSpy).toBeCalledWith(userId);
      expect(findFirstSpy).toBeCalledWith({
        where: {
          user: {
            ladderLevel: {
              gte: lowerRange,
              lte: upperRange,
            },
          },
        },
      });
      expect(updateSpy).toBeCalledWith({
        where: {
          id: matchmaking.id,
        },
        data: {
          opponent: { connect: { id: user.id } },
        },
      });

      findByIdSpy.mockRestore();
      findFirstSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("should return null if no user can found with a ladderLevel of +-50 based on the user's ladderLevel", async () => {
      const userId: number = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const lowerRange = user.ladderLevel - 50;
      const upperRange = user.ladderLevel + 50;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 2,
        opponentUserId: null,
        userReady: false,
        opponentReady: false,
      };

      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(user);
      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, opponentUserId: user.id });

      const result = await service.findOpponent(userId);

      expect(result).toBe(null);
      expect(findByIdSpy).toBeCalledWith(userId);
      expect(findFirstSpy).toBeCalledWith({
        where: {
          user: {
            ladderLevel: {
              gte: lowerRange,
              lte: upperRange,
            },
          },
        },
      });
      expect(updateSpy).not.toBeCalled();

      findByIdSpy.mockRestore();
      findFirstSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("should throw an error if user doesn't exists", async () => {
      const userId: number = 4242;
      const lowerRange = 950;
      const upperRange = 1050;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: null,
        userReady: false,
        opponentReady: false,
      };

      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(null);
      const findFirstSpy = jest
        .spyOn(prismaService.matchmaking, 'findFirst')
        .mockResolvedValue(matchmaking);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, opponentUserId: userId });

      try {
        await service.findOpponent(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe("User doesn't exists");
      }

      expect(findByIdSpy).toBeCalledWith(userId);
      expect(findFirstSpy).not.toBeCalled();
      expect(updateSpy).not.toBeCalled();

      findByIdSpy.mockRestore();
      findFirstSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe('createByUserId', () => {
    it('should create and return a matchmaking entry', async () => {
      const userId: number = 1;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const matchmaking: Matchmaking = {
        id: 1,
        userId: user.id,
        opponentUserId: null,
        userReady: false,
        opponentReady: false,
      };

      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(user);
      const createSpy = jest
        .spyOn(prismaService.matchmaking, 'create')
        .mockResolvedValue(matchmaking);

      const result = await service.createByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(findByIdSpy).toBeCalledWith(userId);
      expect(createSpy).toBeCalledWith({
        data: {
          user: { connect: { id: userId } },
        },
      });

      findByIdSpy.mockRestore();
      createSpy.mockRestore();
    });

    it("should throw an error if user doens't exists", async () => {
      const userId: number = 4242;
      const user: User = {
        id: 1,
        username: 'mmustermann',
        avatarId: null,
        ladderLevel: 1000,
        enabled2FA: false,
        secret2FA: null,
      };
      const matchmaking: Matchmaking = {
        id: 1,
        userId: user.id,
        opponentUserId: null,
        userReady: false,
        opponentReady: false,
      };

      const findByIdSpy = jest
        .spyOn(userService, 'findById')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(prismaService.matchmaking, 'create')
        .mockResolvedValue(matchmaking);

      try {
        await service.createByUserId(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe("User doesn't exists");
      }

      expect(findByIdSpy).toBeCalledWith(userId);
      expect(createSpy).not.toBeCalledWith;

      findByIdSpy.mockRestore();
      createSpy.mockRestore();
    });
  });

  describe('deleteByUserId', () => {
    it('should return deleted matchmaking entry if userId matches', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(matchmaking);
      const deleteSpy = jest
        .spyOn(prismaService.matchmaking, 'delete')
        .mockResolvedValue(matchmaking);

      const result = await service.deleteByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(deleteSpy).toBeCalledWith({
        where: {
          id: matchmaking.id,
        },
      });

      getByUserIdSpy.mockRestore();
      deleteSpy.mockRestore();
    });

    it('should return deleted matchmaking entry if userId matches with opponentUserId', async () => {
      const userId: number = 2;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(matchmaking);
      const deleteSpy = jest
        .spyOn(prismaService.matchmaking, 'delete')
        .mockResolvedValue(matchmaking);

      const result = await service.deleteByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(deleteSpy).toBeCalledWith({
        where: {
          id: matchmaking.id,
        },
      });

      getByUserIdSpy.mockRestore();
      deleteSpy.mockRestore();
    });

    it("should return null if user has no matchmaking entry or user dones't exists", async () => {
      const userId: number = 3;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(null);
      const deleteSpy = jest
        .spyOn(prismaService.matchmaking, 'delete')
        .mockResolvedValue(matchmaking);

      const result = await service.deleteByUserId(userId);

      expect(result).toBe(null);
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(deleteSpy).not.toBeCalled();

      getByUserIdSpy.mockRestore();
      deleteSpy.mockRestore();
    });
  });

  describe('setUserReady', () => {
    it('should set userReady to true and return updated entry', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(matchmaking);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, userReady: true });

      const result = await service.setUserReady(userId);

      expect(result).toStrictEqual({ ...matchmaking, userReady: true });
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(updateSpy).toBeCalledWith({
        where: {
          id: matchmaking.id,
        },
        data: {
          userReady: true,
        },
      });

      getByUserIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should set opponentReady to true and return updated entry', async () => {
      const userId: number = 2;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(matchmaking);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, opponentReady: true });

      const result = await service.setUserReady(userId);

      expect(result).toStrictEqual({ ...matchmaking, opponentReady: true });
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(updateSpy).toBeCalledWith({
        where: {
          id: matchmaking.id,
        },
        data: {
          opponentReady: true,
        },
      });

      getByUserIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should return null if user has no matchmaking entry', async () => {
      const userId: number = 4242;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
        userReady: false,
        opponentReady: false,
      };

      const getByUserIdSpy = jest
        .spyOn(service, 'getByUserId')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(prismaService.matchmaking, 'update')
        .mockResolvedValue({ ...matchmaking, userReady: true });

      const result = await service.setUserReady(userId);

      expect(result).toBe(null);
      expect(getByUserIdSpy).toBeCalledWith(userId);
      expect(updateSpy).not.toBeCalled();

      getByUserIdSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
