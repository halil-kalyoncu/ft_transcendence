import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Match, Prisma } from '@prisma/client';

describe('MatchService', () => {
  let service: MatchService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new match', async () => {
      const newMatch: Prisma.MatchCreateInput = {
        leftUser: {
          connect: { id: 1 },
        },
        type: 'CUSTOM',
      };
      const createdMatch: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const createSpy = jest
        .spyOn(prismaService.match, 'create')
        .mockResolvedValue(createdMatch);

      const result = await service.create(newMatch);

      expect(result).toBe(createdMatch);
      expect(createSpy).toBeCalledWith({
        data: newMatch,
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      createSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should find a match by id', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.match, 'findUnique')
        .mockResolvedValue(match);

      const result = await service.findById(matchId);

      expect(result).toBe(match);
      expect(findUniqueSpy).toBeCalledWith({
        where: { id: matchId },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findUniqueSpy.mockRestore();
    });

    it('should return null when match is not found', async () => {
      const matchId = 4242;

      const findUniqueSpy = jest
        .spyOn(prismaService.match, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.findById(matchId);

      expect(result).toBeNull();
      expect(findUniqueSpy).toBeCalledWith({
        where: { id: matchId },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findUniqueSpy.mockRestore();
    });
  });

  describe('deleteById', () => {
    it('should delete the match by id and return the deleted match', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const deleteSpy = jest
        .spyOn(prismaService.match, 'delete')
        .mockResolvedValue(match);

      const result = await service.deleteById(matchId);

      expect(result).toBe(match);
      expect(deleteSpy).toBeCalledWith({
        where: { id: matchId },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      deleteSpy.mockRestore();
    });

    it('should return null if match is not found', async () => {
      const matchId = 1;

      const deleteSpy = jest
        .spyOn(prismaService.match, 'delete')
        .mockResolvedValue(null);

      const result = await service.deleteById(matchId);

      expect(result).toBeNull;
      expect(deleteSpy).toBeCalledWith({
        where: { id: matchId },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      deleteSpy.mockRestore();
    });
  });

  describe('invite', () => {
    it('should change the state of the match to INVITED and set rightUserId', async () => {
      const matchId = 1;
      const invitedUserId = 2;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(match);
      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue({
          ...match,
          rightUserId: invitedUserId,
          state: 'INVITED',
        });

      const result = await service.invite(matchId, invitedUserId);

      expect(result).toStrictEqual({
        ...match,
        rightUserId: invitedUserId,
        state: 'INVITED',
      });
      expect(findByIdSpy).toBeCalledWith(matchId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          rightUser: { connect: { id: invitedUserId } },
          state: 'INVITED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should return null if match is not found', async () => {
      const matchId = 4242;
      const invitedUserId = 2;

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(null);
      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(null);

      const result = await service.invite(matchId, invitedUserId);

      expect(result).toBeNull;
      expect(findByIdSpy).toHaveBeenCalledWith(matchId);
      expect(updateSpy).not.toBeCalled();

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should throw an error if invitedUserId is the same as leftUserId of the found match', async () => {
      const matchId = 1;
      const invitedUserId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(match);
      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue({
          ...match,
          rightUserId: invitedUserId,
          state: 'INVITED',
        });

      try {
        await service.invite(matchId, invitedUserId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe("Can't invite yourself to a match");
      }

      expect(findByIdSpy).toBeCalledWith(matchId);
      expect(updateSpy).not.toBeCalled();

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should throw an error if user is not found', async () => {
      const matchId = 1;
      const invitedUserId = 4242;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(match);
      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockRejectedValue(new Error());

      try {
        await service.invite(matchId, invitedUserId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
      expect(findByIdSpy).toHaveBeenCalledWith(matchId);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          rightUser: { connect: { id: invitedUserId } },
          state: 'INVITED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findByIdSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe('acceptInvite', () => {
    it('should change the state of the match to ACCEPTED', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: 2,
        type: 'CUSTOM',
        state: 'ACCEPTED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(match);

      const result = await service.acceptInvite(matchId);

      expect(result).toBe(match);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          state: 'ACCEPTED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      updateSpy.mockRestore();
    });

    it('should return null if match is not found', async () => {
      const matchId = 4242;

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(null);

      const result = await service.acceptInvite(matchId);

      expect(result).toBeNull;
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          state: 'ACCEPTED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      updateSpy.mockRestore();
    });
  });

  describe('rejectInvite', () => {
    it('should change the state of the match to CREATED and set rightUserId to null', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: null,
        type: 'CUSTOM',
        state: 'CREATED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: null,
        finishedAt: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(match);

      const result = await service.rejectInvite(matchId);

      expect(result).toBe(match);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          rightUserId: null,
          state: 'CREATED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      updateSpy.mockRestore();
    });

    it('should return null if match is not found', async () => {
      const matchId = 4242;

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(null);

      const result = await service.rejectInvite(matchId);

      expect(result).toBeNull;
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          rightUserId: null,
          state: 'CREATED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      updateSpy.mockRestore();
    });
  });

  describe('getInvites', () => {
    it('should return matches with state INVITED and matching rightUserIds', async () => {
      const userId = 1;
      const matchInvites: Match[] = [
        {
          id: 1,
          leftUserId: 2,
          rightUserId: 1,
          type: 'CUSTOM',
          state: 'INVITED',
          goalsLeftPlayer: 0,
          goalsRightPlayer: 0,
          createdAt: new Date(),
          startedAt: null,
          finishedAt: null,
        },
        {
          id: 1,
          leftUserId: 3,
          rightUserId: 1,
          type: 'CUSTOM',
          state: 'INVITED',
          goalsLeftPlayer: 0,
          goalsRightPlayer: 0,
          createdAt: new Date(),
          startedAt: null,
          finishedAt: null,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.match, 'findMany')
        .mockResolvedValue(matchInvites);

      const result = await service.getInvites(userId);

      expect(result).toBe(matchInvites);
      expect(findManySpy).toBeCalledWith({
        where: {
          rightUserId: userId,
          state: 'INVITED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findManySpy.mockRestore();
    });

    it('should return an empty array if no entries found', async () => {
      const userId = 1;
      const matchInvites: Match[] = [];

      const findManySpy = jest
        .spyOn(prismaService.match, 'findMany')
        .mockResolvedValue(matchInvites);

      const result = await service.getInvites(userId);

      expect(result).toBe(matchInvites);
      expect(findManySpy).toBeCalledWith({
        where: {
          rightUserId: userId,
          state: 'INVITED',
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      findManySpy.mockRestore();
    });
  });

  describe('isInGame', () => {
    it('should return the match object if leftUserId matches', async () => {
      const userId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: 2,
        type: 'CUSTOM',
        state: 'STARTED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: new Date(),
        finishedAt: null,
      };

      const findFirstSpy = jest
        .spyOn(prismaService.match, 'findFirst')
        .mockResolvedValue(match);
      
      const result = await service.isInGame(userId);

      expect(result).toBe(match);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          state: 'STARTED',
          OR: [
            { leftUserId: userId },
            { rightUserId: userId }
          ]
        },
        include: {
          leftUser: true,
          rightUser: true
        }
      });

      findFirstSpy.mockRestore();
    });

    it('should return the match object if rightUserId matches', async () => {
      const userId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 2,
        rightUserId: 1,
        type: 'CUSTOM',
        state: 'STARTED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: new Date(),
        finishedAt: null,
      };

      const findFirstSpy = jest
        .spyOn(prismaService.match, 'findFirst')
        .mockResolvedValue(match);
      
      const result = await service.isInGame(userId);

      expect(result).toBe(match);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          state: 'STARTED',
          OR: [
            { leftUserId: userId },
            { rightUserId: userId }
          ]
        },
        include: {
          leftUser: true,
          rightUser: true
        }
      });

      findFirstSpy.mockRestore();
    });

    it('should return null if user is not in game', async () => {
      const userId = 1;

      const findFirstSpy = jest
        .spyOn(prismaService.match, 'findFirst')
        .mockResolvedValue(null);
      
      const result = await service.isInGame(userId);

      expect(result).toBe(null);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          state: 'STARTED',
          OR: [
            { leftUserId: userId },
            { rightUserId: userId }
          ]
        },
        include: {
          leftUser: true,
          rightUser: true
        }
      });

      findFirstSpy.mockRestore();
    });

    it("should return null if user doesn't exists", async () => {
      const userId = 4242;

      const findFirstSpy = jest
        .spyOn(prismaService.match, 'findFirst')
        .mockResolvedValue(null);
      
      const result = await service.isInGame(userId);

      expect(result).toBe(null);
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          state: 'STARTED',
          OR: [
            { leftUserId: userId },
            { rightUserId: userId }
          ]
        },
        include: {
          leftUser: true,
          rightUser: true
        }
      });

      findFirstSpy.mockRestore();
    });
  });

  describe('startMatch', () => {
    it('should change the state to STARTED and set startedAt', async () => {
      const matchId = 1;
      const match: Match = {
        id: 1,
        leftUserId: 1,
        rightUserId: 2,
        type: 'CUSTOM',
        state: 'STARTED',
        goalsLeftPlayer: 0,
        goalsRightPlayer: 0,
        createdAt: new Date(),
        startedAt: new Date(),
        finishedAt: null,
      };

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(match);

      const result = await service.startMatch(matchId);

      expect(result).toBe(match);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          state: 'STARTED',
          startedAt: match.startedAt,
        },
        include: {
          leftUser: true,
          rightUser: true,
        },
      });

      updateSpy.mockRestore();
    });

    it('should return null if match is not found', async () => {
      const matchId = 4242;

      const updateSpy = jest
        .spyOn(prismaService.match, 'update')
        .mockResolvedValue(null);

      const result = await service.startMatch(matchId);

      expect(result).toBeNull;

      updateSpy.mockRestore();
    });
  });
});
