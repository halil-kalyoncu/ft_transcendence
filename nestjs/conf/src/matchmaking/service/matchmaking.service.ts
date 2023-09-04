import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Matchmaking, User } from '@prisma/client';
import { UserService } from '../../user/service/user-service/user.service';

@Injectable()
export class MatchmakingService {

    constructor(
        private prisma: PrismaService,
        private userService: UserService
    ) {}

    async getByUserId(userId: number): Promise<Matchmaking | null> {
        return this.prisma.matchmaking.findUnique({
            where: {
                userId
            }
        });
    }

    async findOpponent(userId: number): Promise<Matchmaking | null> {
        const user: User = await this.userService.findById(userId);

        if (!user) {
            throw new Error("User doesn't exists");
        }

        const lowerRange = user.ladderLevel - 50;
        const upperRange = user.ladderLevel + 50;
        return this.prisma.matchmaking.findFirst({
            where: {
                user: {
                    ladderLevel: {
                        gte: lowerRange,
                        lte: upperRange
                    }
                }                
            }
        });
    }

    async createByUserId(userId: number): Promise<Matchmaking> {
        return await this.prisma.matchmaking.create({
            data: {
                userId
            }
        });
    }

    async deleteByUserId(userId: number): Promise<Matchmaking> {
        return await this.prisma.matchmaking.delete({
            where: {
                userId
            }
        });
    }
}
