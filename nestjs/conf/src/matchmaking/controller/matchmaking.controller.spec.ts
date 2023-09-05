import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from '../service/matchmaking.service';
import { UserService } from '../../user/service/user-service/user.service';
import { JwtAuthService } from '../../auth/service/jwt-auth/jtw-auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConnectedUserService } from '../../chat/service/connected-user/connected-user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Matchmaking } from '@prisma/client';

describe('MatchmakingController', () => {
  let controller: MatchmakingController;
  let matchmakingService: MatchmakingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakingController],
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

    controller = module.get<MatchmakingController>(MatchmakingController);
    matchmakingService = module.get<MatchmakingService>(MatchmakingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByUserId', () => {
    it('should return matchmaking entry if userId matches', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
      };

      const getByUserIdSpy = jest
        .spyOn(matchmakingService, 'getByUserId')
        .mockResolvedValue(matchmaking);

      const result = await controller.getByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(getByUserIdSpy).toBeCalledWith(userId);

      getByUserIdSpy.mockRestore();
    });

    it('should return matchmaking entry if userId matches with opponentUserId', async () => {
      const userId: number = 2;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
      };

      const getByUserIdSpy = jest
        .spyOn(matchmakingService, 'getByUserId')
        .mockResolvedValue(matchmaking);

      const result = await controller.getByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(getByUserIdSpy).toBeCalledWith(userId);

      getByUserIdSpy.mockRestore();
    });

    it("should return null if user has no matchmaking entry or user doesn't exists", async () => {
      const userId: number = 4242;

      const getByUserIdSpy = jest
        .spyOn(matchmakingService, 'getByUserId')
        .mockResolvedValue(null);

      const result = await controller.getByUserId(userId);

      expect(result).toBe(null);
      expect(getByUserIdSpy).toBeCalledWith(userId);

      getByUserIdSpy.mockRestore();
    });
  });

  describe('deleteByUserId', () => {
    it('should return deleted matchmaking entry if userId matches', async () => {
      const userId: number = 1;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
      };

      const deleteSpy = jest
        .spyOn(matchmakingService, 'deleteByUserId')
        .mockResolvedValue(matchmaking);

      const result = await controller.deleteByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(deleteSpy).toBeCalledWith(userId);

      deleteSpy.mockRestore();
    });

    it('should return deleted matchmaking entry if userId matches with opponentUserId', async () => {
      const userId: number = 2;
      const matchmaking: Matchmaking = {
        id: 1,
        userId: 1,
        opponentUserId: 2,
      };

      const deleteSpy = jest
        .spyOn(matchmakingService, 'deleteByUserId')
        .mockResolvedValue(matchmaking);

      const result = await controller.deleteByUserId(userId);

      expect(result).toBe(matchmaking);
      expect(deleteSpy).toBeCalledWith(userId);

      deleteSpy.mockRestore();
    });

    it('should return null if user has no matchmaking entry', async () => {
      const userId: number = 4242;

      const deleteSpy = jest
        .spyOn(matchmakingService, 'deleteByUserId')
        .mockResolvedValue(null);

      const result = await controller.deleteByUserId(userId);

      expect(result).toBe(null);
      expect(deleteSpy).toBeCalledWith(userId);

      deleteSpy.mockRestore();
    });
  });
});
