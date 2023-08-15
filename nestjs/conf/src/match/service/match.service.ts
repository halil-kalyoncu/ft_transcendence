import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Match, Prisma } from '@prisma/client';

@Injectable()
export class MatchService {

    constructor(private prisma: PrismaService) {}

    async create(newMatch: Prisma.MatchCreateInput): Promise<Match> {
        return await this.prisma.match.create({
            data: newMatch, 
            include: {
                leftUser: true,
                rightUser: true
            }
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
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

    async invite(id: number, invitedUserId: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                rightUser: { connect: { id: invitedUserId } },
                state: 'INVITED'
            },
            include: {
                leftUser: true,
                rightUser: true
            }
        })
    }

    async acceptInvite(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                state: 'ACCEPTED'
            },
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

    async rejectInvite(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                rightUserId: null,
                state: 'CREATED'
            },
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

    async getInvites(userId: number): Promise<Match[]> {
        return await this.prisma.match.findMany({
            where: {
                rightUserId: userId,
                state: 'INVITED'
            },
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

    async startMatch(id: number): Promise<Match> {
        return await this.prisma.match.update({
            where: { id },
            data: {
                state: 'STARTED'
            }, 
            include: {
                leftUser: true,
                rightUser: true
            }
        });
    }

}
