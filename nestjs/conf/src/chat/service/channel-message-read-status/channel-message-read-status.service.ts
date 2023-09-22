import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessageReadStatus } from '@prisma/client';

@Injectable()
export class ChannelMessageReadStatusService {
  constructor(private prisma: PrismaService) {}
  async getUnreadStatus(
    channelId: number,
    userId: number,
  ): Promise<ChannelMessageReadStatus[]> {
      const unreadMessages =
        await this.prisma.channelMessageReadStatus.findMany({
          where: {
            reader: {
              channelId: channelId,
              userId: userId,
            },
            isRead: false,
          },
        });
      return unreadMessages;
  }
}
