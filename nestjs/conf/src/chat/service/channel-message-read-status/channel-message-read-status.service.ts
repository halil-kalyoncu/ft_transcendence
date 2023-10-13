import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessageReadStatus, User } from '@prisma/client';
import { BlockedUserService } from '../blocked-user/blocked-user.service';

@Injectable()
export class ChannelMessageReadStatusService {
  constructor(
    private prisma: PrismaService,
    private blockedUserService: BlockedUserService,
  ) {}

  async getUnreadStatus(
    channelId: number,
    userId: number,
  ): Promise<ChannelMessageReadStatus[]> {
    try {
      const blockedUsers: User[] = await this.blockedUserService.getUsers(
        userId,
      );
      const blockedUserIds: number[] = blockedUsers.map((user) => user.id);

      const unreadMessages =
        await this.prisma.channelMessageReadStatus.findMany({
          where: {
            NOT: {
              message: {
                senderId: {
                  in: blockedUserIds,
                },
              },
            },
            reader: {
              channelId: channelId,
              userId: userId,
            },
            isRead: false,
          },
        });
      return unreadMessages;
    } catch (error) {
      throw new Error('Error fetching unread messages: ' + error.message);
    }
  }
}
