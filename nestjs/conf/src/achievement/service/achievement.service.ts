import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserAchievements, AchievementState } from '@prisma/client';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  async updateAchievement(
    userId: number,
    achievementId: number,
    score: number,
  ): Promise<UserAchievements> {
    let currentProgress: number =
      (await this.getAchievementProgress(userId, achievementId)) + score;
    let currentState: AchievementState;

    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
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
        userId_achievementId: { userId: userId, achievementId: achievementId },
      },
      data: {
        progress: { increment: score },
        state: currentState,
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

  async getUserAchievements(userId: number): Promise<UserAchievements[]> {
    return await this.prisma.userAchievements.findMany({
      where: {
        userId: userId,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        state: 'desc',
      },
    });
  }
}
