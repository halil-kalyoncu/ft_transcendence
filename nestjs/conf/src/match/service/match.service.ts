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
  MatchType,
  Powerup,
  Prisma,
} from '@prisma/client';
import { Room } from '../../game/service/room.service';
import { PowerupService } from '../../powerup/service/powerup.service';
import { AchievementService } from '../../achievement/service/achievement.service';
import { matchOutcomesDto } from '../dto/match-outcomes.dto';
import { UserService } from '../../user/service/user-service/user.service';

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaService,
    private powerupService: PowerupService,
    private achievementService: AchievementService,
    private userService: UserService,
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

  async findMatchByUser(userid: number): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: {
        OR: [{ leftUserId: userid }, { rightUserId: userid }],
        AND: [
          {
            state: {
              in: [
                'WINNERLEFT',
                'WINNERRIGHT',
                'DISCONNECTLEFT',
                'DISCONNECTRIGHT',
              ],
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        leftUser: true,
        rightUser: true,
      },
    });
  }

  async getMatchOutcomesByUserId(userId: number): Promise<matchOutcomesDto> {
    let wins = 0;
    let losses = 0;

    const matches: Match[] = await this.prisma.match.findMany({
      where: {
        OR: [{ leftUserId: userId }, { rightUserId: userId }],
      },
    });
    matches.map((match: Match) => {
      if (
        match.leftUserId === userId &&
        (match.state === 'WINNERLEFT' || match.state === 'DISCONNECTRIGHT')
      ) {
        wins++;
      } else if (
        match.rightUserId &&
        match.rightUserId === userId &&
        (match.state === 'WINNERRIGHT' || match.state === 'DISCONNECTLEFT')
      ) {
        wins++;
      } else if (
        match.rightUserId &&
        match.rightUserId === userId &&
        (match.state === 'WINNERLEFT' || match.state === 'DISCONNECTRIGHT')
      ) {
        losses++;
      } else if (
        match.leftUserId === userId &&
        (match.state === 'WINNERRIGHT' || match.state === 'DISCONNECTLEFT')
      ) {
        losses++;
      }
    });
    return { wins: wins, losses: losses };
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
    } else if (match.state === 'INVITED') {
      throw new BadRequestException('Already sent a game invite');
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
    await this.prisma.matchPowerup.deleteMany({
      where: {
        matchId: id,
      },
    });

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

    if (room.leftPlayerGoals === room.goalsToWin) {
      if (room.rightPlayerGoals === 0) {
        flawlessVictory = room.leftPlayerId;
      }
      state = 'WINNERLEFT';
    } else if (room.rightPlayerGoals === room.goalsToWin) {
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

  async finishMatch(room: Room): Promise<Match | null> {
    const { state, flawlessVictory } = this.determineMatchState(room);
    const match = await this.prisma.match.findUnique({
      where: {
        id: room.id,
      },
    });

    if (
      !match ||
      match.state === 'WINNERLEFT' ||
      match.state === 'WINNERRIGHT' ||
      match.state === 'DISCONNECTRIGHT' ||
      match.state === 'DISCONNECTLEFT'
    ) {
      return null;
    }

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

    if (updatedMatch.type === MatchType.LADDER) {
      let outcome = 0;

      if (
        state === MatchState.WINNERLEFT ||
        state === MatchState.DISCONNECTRIGHT
      ) {
        outcome = 1;
      }
      const { newLadderLevelLeftPlayer, newLadderLevelRightPlayer } =
        this.updateRatings(
          updatedMatch.leftUser.ladderLevel,
          updatedMatch.rightUser.ladderLevel,
          outcome,
        );

      try {
        await this.userService.updateLadderLevel(
          updatedMatch.leftUserId,
          newLadderLevelLeftPlayer,
        );
        await this.userService.updateLadderLevel(
          updatedMatch.rightUserId,
          newLadderLevelRightPlayer,
        );
      } catch (error) {
        console.log(
          'Something went wrong updating the ladder Levels of the players of the match ',
          updatedMatch.id,
        );
      }
    }

    await this.achievementService.updateAchievement(
      updatedMatch.leftUserId,
      1,
      room.leftPlayerGoals,
    );

    await this.achievementService.updateAchievement(
      updatedMatch.rightUserId,
      1,
      room.rightPlayerGoals,
    );

    if (room.firstGoal === 'LEFT')
      await this.achievementService.updateAchievement(
        updatedMatch.leftUserId,
        5,
        1,
      );
    else
      await this.achievementService.updateAchievement(
        updatedMatch.rightUserId,
        5,
        1,
      );

    if (flawlessVictory && flawlessVictory !== 0) {
      await this.achievementService.updateAchievement(flawlessVictory, 2, 1);
    }

    if (state === 'WINNERLEFT' || state === 'DISCONNECTRIGHT') {
      if (room.comeback == 'LEFT')
        this.achievementService.updateAchievement(
          updatedMatch.leftUserId,
          4,
          1,
        );
      this.achievementService.updateAchievement(updatedMatch.leftUserId, 3, 1);
    } else {
      if (room.comeback == 'RIGHT')
        this.achievementService.updateAchievement(
          updatedMatch.rightUserId,
          4,
          1,
        );
      this.achievementService.updateAchievement(updatedMatch.rightUserId, 3, 1);
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

  async checkAlreadyInvited(
    leftUserId: number,
    rightUserId: number,
  ): Promise<Match | null> {
    return this.prisma.match.findFirst({
      where: {
        leftUserId,
        rightUserId,
        state: 'INVITED',
      },
    });
  }

  private calculateExpectedProbability(
    ladderLevelLeftPlayer: number,
    ladderLevelRightPlayer: number,
  ) {
    return (
      1 /
      (1 + Math.pow(10, (ladderLevelRightPlayer - ladderLevelLeftPlayer) / 400))
    );
  }

  private updateRatings(
    ladderLevelLeftPlayer: number,
    ladderLevelRightPlayer: number,
    outcome: number,
  ) {
    const K = 50;

    const expectedProbabilityLeftPlayer = this.calculateExpectedProbability(
      ladderLevelLeftPlayer,
      ladderLevelRightPlayer,
    );
    const expectedProbabilityRightPlayer = 1 - expectedProbabilityLeftPlayer;

    const deltaLeftPlayer = K * (outcome - expectedProbabilityLeftPlayer);
    const deltaRightPlayer = K * (1 - outcome - expectedProbabilityRightPlayer);

    let newLadderLevelLeftPlayer = ladderLevelLeftPlayer + deltaLeftPlayer;
    let newLadderLevelRightPlayer = ladderLevelRightPlayer + deltaRightPlayer;
    if (newLadderLevelLeftPlayer < 0) {
      newLadderLevelLeftPlayer = 0;
    }
    if (newLadderLevelRightPlayer < 0) {
      newLadderLevelRightPlayer = 0;
    }

    return { newLadderLevelLeftPlayer, newLadderLevelRightPlayer };
  }
}
