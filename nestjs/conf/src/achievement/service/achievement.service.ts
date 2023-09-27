import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserAchievements } from '@prisma/client';
import { Achievement } from '@prisma/client';

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
    return this.prisma.userAchievements.update({
      where: {
        userId_achievementId: { userId: userId, achievementId: 2 },
      },
      data: {
        progress: {
          increment: 1,
        },
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
		achievement: true
	  }
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    return await this.prisma.achievement.findMany()
  }
}
