import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserAchievements, Achievement, AchievementState } from '@prisma/client';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  async updateTotalGoals(userId: number, goals: number): Promise<void> {
    await this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 1 },
      },
      data: {
        progress: {
          increment: goals,
        },
      },
    });
  }
  // Update flawless victory count
  async updateFlawlessVictory(userId: number): Promise<UserAchievements> {
    let currentProgress = await this.getAchievementProgress(userId, 2) + 1;
    let currentState: AchievementState

    const achievement = await this.prisma.achievement.findUnique({
      where: { id: 2 },
      select: {
        scoreBronze: true,
        scoreSilver: true,
        scoreGold: true,
      },
    });

    if (currentProgress >= achievement.scoreGold) {
      currentState = AchievementState.GOLD;
    } else if (currentProgress >= achievement.scoreSilver) {
      currentState = AchievementState.SILVER;
    } else if (currentProgress >= achievement.scoreBronze) {
      currentState = AchievementState.BRONZE;
    } else currentState = AchievementState.NONE;

    return this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 2 },
      },
      data: {
        progress: { increment: 1 },
		state: currentState
      },
    });
  }

  async updateTotalWins(userId: number): Promise<void> {
    await this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 3 },
      },
      data: {
        progress: {
          increment: 1,
        },
      },
    });
  }

  async updateComebacks(userId: number): Promise<void> {
    await this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 4 },
      },
      data: {
        progress: {
          increment: 1,
        },
      },
    });
  }

  async updateFistGoal(userId: number): Promise<void> {
    await this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 5 },
      },
      data: {
        progress: {
          increment: 1,
        },
      },
    });
  }

  async getAchievementProgress(
    userId: number,
    achievementId: number,
  ): Promise<number> {
    const achievement = await this.prisma.userAchievements.findUnique({
      where: {
        userId_achievementId: { userId: userId, achievementId: achievementId },
      },
      select: {
        progress: true,
      },
    });
    return achievement.progress;
  }

//   async getAchievementState(
//     userId: number,
//     achievementId: number,
//   ): Promise<UserAchievementState> {
//     const achievement = await this.prisma.userAchievements.findUnique({
//       where: {
//         userId_achievementId: { userId: userId, achievementId: achievementId },
//       },
//       select: {
//         state: true,
//       },
//     });
//     return achievement.state;
//   }

  async getUserAchievements(userId: number): Promise<UserAchievements[]> {
    return await this.prisma.userAchievements.findMany({
      where: {
        userId: userId,
      },
      include: {
        achievement: true,
      },
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    return await this.prisma.achievement.findMany();
  }
}
