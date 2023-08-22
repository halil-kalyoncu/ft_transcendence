import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockedUser, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserService } from '../../../user/service/user-service/user.service';

@Injectable()
export class BlockedUserService {

    constructor(
        private prisma: PrismaService,
        private userService: UserService
    ) {}

    async block(userId: number, targetUserId: number): Promise<BlockedUser> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const targetUser = await this.userService.findById(targetUserId);
        if (!targetUser) {
            throw new NotFoundException('Target user not found');
        }

        const isAlreadyBlocked = user.blockedUsers.some(blockedUser => blockedUser.targetUserId === targetUserId);
        if (isAlreadyBlocked) {
            return isAlreadyBlocked;
        }

        return this.prisma.blockedUser.create({
            data: {
                userId,
                targetUserId
            }
        });
    }

    // async unblock(userId: number, targetUserId: number): Promise<BlockedUser> {
        
    // }

    async find(userId: number, targetUserId: number) {
        return this.prisma.blockedUser.findFirst({
            where: {
                userId,
                targetUserId
            }
        });
    }

    async remove(blockedUserId: number): Promise<BlockedUser> {
        return this.prisma.blockedUser.delete({
            where: {
                id: blockedUserId
            }
        });
    }
}
