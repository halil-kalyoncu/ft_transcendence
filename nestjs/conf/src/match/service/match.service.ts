import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Match, Prisma } from '@prisma/client';

@Injectable()
export class MatchService {

    constructor(private prisma: PrismaService) {}

    async create(newMatch: Prisma.MatchCreateInput): Promise<Match> {
        return await this.prisma.match.create({
            data: newMatch
        })
    }

    async findById(id: number): Promise<Match | null> {
        return await this.prisma.match.findUnique({
            where: { id },
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

    async deleteById(id: number): Promise<Match | null> {
        return await this.prisma.match.delete({
            where: { id },
        });
    }

    async invite(id: number, invitedUserId: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                rightUser: { connect: { id: invitedUserId } },
                state: 'INVITED'
            }
        })
    }

    async acceptInvite(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                state: 'ACCEPTED'
            }
        });
    }

    async rejectInvite(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                rightUser: null,
                state: 'CREATED'
            }
        });
    }

    async getInvites(userId: number): Promise<Match[]> {
        return await this.prisma.match.findMany({
            where: {
                rightUserId: userId
            }
        });
    }

    async startMatch(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                state: 'STARTED'
            }
        });
    }

}
