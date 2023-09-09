import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Matchmaking, User } from '@prisma/client';
import { UserService } from '../../user/service/user-service/user.service';

@Injectable()
export class MatchmakingService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async find(id: number): Promise<Matchmaking | null> {
    return this.prisma.matchmaking.findUnique({
      where: { id },
    });
  }

  async getByUserId(userId: number): Promise<Matchmaking | null> {
    return this.prisma.matchmaking.findFirst({
      where: {
        OR: [{ userId }, { opponentUserId: userId }],
      },
    });
  }

  async findOpponent(userId: number): Promise<Matchmaking | null> {
    const user: User = await this.userService.findById(userId);

    if (!user) {
      throw new Error("User doesn't exists");
    }

    const lowerRange = user.ladderLevel - 50;
    const upperRange = user.ladderLevel + 50;
    const matchmaking: Matchmaking = await this.prisma.matchmaking.findFirst({
      where: {
        user: {
          ladderLevel: {
            gte: lowerRange,
            lte: upperRange,
          },
        },
      },
    });

    if (!matchmaking) {
      return null;
    }

    return this.prisma.matchmaking.update({
      where: {
        id: matchmaking.id,
      },
      data: {
        opponent: { connect: { id: user.id } },
      },
    });
  }

  async createByUserId(userId: number): Promise<Matchmaking> {
    const user: User = await this.userService.findById(userId);

    if (!user) {
      throw new Error("User doesn't exists");
    }
    return await this.prisma.matchmaking.create({
      data: {
        user: { connect: { id: userId } },
      },
    });
  }

  async deleteByUserId(userId: number): Promise<Matchmaking | null> {
    const matchmaking: Matchmaking = await this.getByUserId(userId);

    if (!matchmaking) {
      return null;
    }
    return await this.prisma.matchmaking.delete({
      where: {
        id: matchmaking.id,
      },
    });
  }
}