import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Match,
  MatchPowerup,
  MatchState,
  Powerup,
  Prisma,
} from '@prisma/client';
import { Room } from '../../game/service/room.service';
import { PowerupService } from '../../powerup/service/powerup.service';
import { AchievementService } from '../../achievement/service/achievement.service';

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaService,
    private powerupService: PowerupService,
    private achievementService: AchievementService,
  ) {}

  async create(newMatch: Prisma.MatchCreateInput): Promise<Match> {
    return await this.prisma.match.create({
      data: newMatch,
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  //   async findUserByName(username: string): Promise<Match> {
  // 	return await this.prisma.match.findUnique({
  // 	  where: {
  // 		username: username,
  // 	  },
  // 	});
  //   }
  // async findUserByName(username: string): Promise<User | null> {
  // 	return await this.prisma.user.findUnique({
  // 	where: {
  // 		username: username,
  // 	},
  // 	});
  // }

  async findMatchByUser(userid: number): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: {
        OR: [{ leftUserId: userid }, { rightUserId: userid }],
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async findAll(): Promise<Match[]> {
    return await this.prisma.match.findMany({
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async findById(id: number): Promise<Match | null> {
    return await this.prisma.match.findUnique({
      where: { id },
      include: {
        leftUser: true,
        rightUser: true,
        powerups: true,
      },
    });
  }

  async deleteById(id: number): Promise<Match | null> {
    return await this.prisma.match.delete({
      where: { id },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async invite(
    id: number,
    invitedUserId: number,
    goalsToWin: number,
    powerups: Powerup[],
  ): Promise<Match | null> {
    const match = await this.findById(id);

    if (!match) {
      return null;
    } else if (match.leftUserId == invitedUserId) {
      throw new BadRequestException("Can't invite yourself to a match");
    }

    const matchPowerups = await Promise.all(
      powerups.map(async (powerup) => {
        return await this.prisma.matchPowerup.create({
          data: {
            matchId: id,
            powerupId: powerup.id,
          },
        });
      }),
    );

    return await this.prisma.match.update({
      where: { id },
      data: {
        rightUser: { connect: { id: invitedUserId } },
        state: 'INVITED',
        goalsToWin,
        powerups: {
          connect: matchPowerups.map((matchPowerup) => ({
            id: matchPowerup.id,
          })),
        },
      },
      include: {
        leftUser: true,
        rightUser: true,
        powerups: true,
      },
    });
  }

  async acceptInvite(id: number): Promise<Match | null> {
    return await this.prisma.match.update({
      where: { id },
      data: {
        state: 'ACCEPTED',
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async rejectInvite(id: number): Promise<Match | null> {
    return await this.prisma.match.update({
      where: { id },
      data: {
        rightUserId: null,
        state: 'CREATED',
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async getInvites(userId: number): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: {
        rightUserId: userId,
        state: 'INVITED',
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async isInGame(userId: number): Promise<Match | null> {
    return await this.prisma.match.findFirst({
      where: {
        state: 'STARTED',
        OR: [{ leftUserId: userId }, { rightUserId: userId }],
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async startMatch(id: number): Promise<Match | null> {
    return await this.prisma.match.update({
      where: { id },
      data: {
        state: 'STARTED',
        startedAt: new Date(),
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  // Determine the state of the match
  determineMatchState(room: Room): {
    state: MatchState;
    flawlessVictory: number;
  } {
    let flawlessVictory = 0;
    let state: MatchState;

    if (room.leftPlayerGoals === 5) {
      if (room.rightPlayerGoals === 0) {
        flawlessVictory = room.leftPlayerId;
      }
      state = 'WINNERLEFT';
    } else if (room.rightPlayerGoals === 5) {
      if (room.leftPlayerGoals === 0) {
        flawlessVictory = room.rightPlayerId;
      }
      state = 'WINNERRIGHT';
    } else if (room.leftPlayerDisconnect) {
      state = 'DISCONNECTLEFT';
    } else {
      state = 'DISCONNECTRIGHT';
    }

    return { state, flawlessVictory };
  }

  //   // Increment the goals of a player
  //   async updatePlayerGoals(userId: number, goals: number): Promise<void> {
  //     await this.prisma.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         totalGoals: {
  //           increment: goals,
  //         },
  //       },
  //     });
  //   }

  //   async updateTotalWins(userId: number): Promise<void> {
  //     await this.prisma.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         totalWins: {
  //           increment: 1,
  //         },
  //       },
  //     });
  //   }

  async finishMatch(room: Room): Promise<Match | null> {
    const { state, flawlessVictory } = this.determineMatchState(room);

    const updatedMatch = await this.prisma.match.update({
      where: {
        id: room.id,
      },
      data: {
        state: state,
        finishedAt: new Date(),
        goalsLeftPlayer: room.leftPlayerGoals,
        goalsRightPlayer: room.rightPlayerGoals,
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });

    await this.achievementService.updateTotalGoals(
      updatedMatch.leftUserId,
      room.leftPlayerGoals,
    );

    await this.achievementService.updateTotalGoals(
      updatedMatch.rightUserId,
      room.rightPlayerGoals,
    );

    if (flawlessVictory && flawlessVictory !== 0) {
      await this.achievementService.updateFlawlessVictory(flawlessVictory);
    }

    if (state === 'WINNERLEFT' || state === 'DISCONNECTRIGHT') {
      if (room.comeback == 'LEFT')
        this.achievementService.updateComebacks(updatedMatch.leftUserId);
      this.achievementService.updateTotalWins(updatedMatch.leftUserId);
    } else {
      if (room.comeback == 'RIGHT')
        this.achievementService.updateComebacks(updatedMatch.rightUserId);
      this.achievementService.updateTotalWins(updatedMatch.rightUserId);
    }

    return updatedMatch;
  }

  async getPowerupNames(id: number): Promise<string[]> {
    const powerupNames: string[] = [];
    const match: Match = await this.findById(id);

    if (!match) {
      throw new NotFoundException("Can't find match");
    }

    const matchPowerups: MatchPowerup[] =
      await this.prisma.matchPowerup.findMany({
        where: {
          matchId: match.id,
        },
      });

    for (const matchPowerup of matchPowerups) {
      const powerup = await this.powerupService.findById(
        matchPowerup.powerupId,
      );
      if (powerup) {
        powerupNames.push(powerup.name);
      }
    }

    return powerupNames;
  }
}
