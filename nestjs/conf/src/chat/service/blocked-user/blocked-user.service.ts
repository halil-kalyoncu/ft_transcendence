import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockedUser, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { PrismaModel } from '../../../_gen/prisma-class/index';

@Injectable()
export class BlockedUserService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async block(userId: number, targetUserId: number): Promise<BlockedUser> {
    const isAlreadyBlocked = await this.find(userId, targetUserId);
    if (isAlreadyBlocked) {
      //or return error if already blocked?
      return isAlreadyBlocked;
    }

    return await this.prisma.blockedUser.create({
      data: {
        userId,
        targetUserId,
      },
      include: {
        user: true,
        targetUser: true,
      },
    });
  }

  async unblock(userId: number, targetUserId: number): Promise<BlockedUser> {
    const block = await this.find(userId, targetUserId);
    if (!block) {
      //return error?
      return;
    }

    return await this.prisma.blockedUser.delete({
      where: {
        id: block.id,
      },
      include: {
        user: true,
        targetUser: true,
      },
    });
  }

  async getBlockedUsers(userId: number): Promise<any> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.blockedUser.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
        targetUser: true,
      },
    });
  }

  async getUsers(userId: number): Promise<User[]> {
    const blockedUsers = await this.getBlockedUsers(userId);

    return blockedUsers.map((blockedUser) => blockedUser.targetUser);
  }

  async find(userId: number, targetUserId: number): Promise<BlockedUser> {
    await this.checkIds(userId, targetUserId);

    return await this.prisma.blockedUser.findUnique({
      where: {
        userId_targetUserId: {
          userId,
          targetUserId,
        },
      },
      include: {
        user: true,
        targetUser: true,
      },
    });
  }

  async remove(blockedUserId: number): Promise<BlockedUser> {
    return await this.prisma.blockedUser.delete({
      where: {
        id: blockedUserId,
      },
    });
  }

  private async checkIds(userId: number, targetUserId: number): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const targetUser = await this.userService.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    if (userId === targetUserId) {
      throw new Error("Can't block yourself");
    }
    return;
  }
}
