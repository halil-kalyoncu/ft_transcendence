import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { MatchService } from '../service/match.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { Match } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('MatchController', () => {
  let controller: MatchController;
  let matchService: MatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
      ],
    }).compile();

    controller = module.get<MatchController>(MatchController);
    matchService = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should return created match', async () => {
      const createMatchDto: CreateMatchDto = {
        userId: 1,
        matchType: 'CUSTOM',
      };
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        goalsToWin: 5,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const createSpy = jest
        .spyOn(matchService, 'create')
        .mockResolvedValue(match);

      const result = await controller.createMatch(createMatchDto);

      expect(result).toBe(match);
      expect(createSpy).toBeCalled();

      createSpy.mockRestore();
    });

    it("should throw HttpException when userId doesn't exists", async () => {
      const createMatchDto: CreateMatchDto = {
        userId: 4242,
        matchType: 'CUSTOM',
      };

      const createSpy = jest
        .spyOn(matchService, 'create')
        .mockRejectedValue(new Error());

      try {
        await controller.createMatch(createMatchDto);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      expect(createSpy).toBeCalled();

      createSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return match by id', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        goalsToWin: 5,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const findByIdSpy = jest
        .spyOn(matchService, 'findById')
        .mockResolvedValue(match);

      const result = await controller.findById(matchId);

      expect(result).toBe(match);
      expect(findByIdSpy).toBeCalledWith(matchId);

      findByIdSpy.mockRestore();
    });

    it("should return null if id doesn't exists", async () => {
      const matchId = 4242;

      const findByIdSpy = jest
        .spyOn(matchService, 'findById')
        .mockResolvedValue(null);

      const result = await controller.findById(matchId);

      expect(result).toBe(null);
      expect(findByIdSpy).toBeCalledWith(matchId);

      findByIdSpy.mockRestore();
    });
  });

  describe('getInvitesByUserId', () => {
    it('should return array with 2 matches with the state INVITE and matching rightUserIds', async () => {
      const userId = 1;
      const matches: Match[] = [
        {
          id: 1,
          leftUserId: 2,
          rightUserId: userId,
          type: 'CUSTOM',
          state: 'INVITED',
          goalsLeftPlayer: 0,
          goalsRightPlayer: 0,
          goalsToWin: 5,
          createdAt: new Date(),
          startedAt: null,
          finishedAt: null,
        },
        {
          id: 2,
          leftUserId: 3,
          rightUserId: userId,
          type: 'CUSTOM',
          state: 'INVITED',
          goalsLeftPlayer: 0,
          goalsRightPlayer: 0,
          goalsToWin: 5,
          createdAt: new Date(),
          startedAt: null,
          finishedAt: null,
        },
      ];

      const getInvitesSpy = jest
        .spyOn(matchService, 'getInvites')
        .mockResolvedValue(matches);

      const result = await controller.getInvitesByUserId(userId);

      expect(result).toBe(matches);
      expect(getInvitesSpy).toBeCalledWith(userId);

      getInvitesSpy.mockRestore();
    });

    it('should return array with one match with the state INVITE and matching rightUserId', async () => {
      const userId = 1;
      const matches: Match[] = [
        {
          id: 1,
          leftUserId: 2,
          rightUserId: userId,
          type: 'CUSTOM',
          state: 'INVITED',
          goalsLeftPlayer: 0,
          goalsRightPlayer: 0,
          goalsToWin: 5,
          createdAt: new Date(),
          startedAt: null,
          finishedAt: null,
        },
      ];

      const getInvitesSpy = jest
        .spyOn(matchService, 'getInvites')
        .mockResolvedValue(matches);

      const result = await controller.getInvitesByUserId(userId);

      expect(result).toBe(matches);
      expect(getInvitesSpy).toBeCalledWith(userId);

      getInvitesSpy.mockRestore();
    });

    it('should return empty array', async () => {
      const userId = 1;
      const matches: Match[] = [];

      const getInvitesSpy = jest
        .spyOn(matchService, 'getInvites')
        .mockResolvedValue(matches);

      const result = await controller.getInvitesByUserId(userId);

      expect(result).toBe(matches);
      expect(getInvitesSpy).toBeCalledWith(userId);

      getInvitesSpy.mockRestore();
    });
  });
});
