import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMember, ChannelMemberRole } from '@prisma/client';

@Injectable()
export class ChannelMemberService {
  constructor(private prisma: PrismaService) {}

  async findOwner(channelId: number): Promise<ChannelMember> {
    return this.prisma.channelMember.findFirst({
      where: {
        channelId,
        role: ChannelMemberRole.OWNER,
      },
    });
  }

  async find(channelId: number, userId: number): Promise<ChannelMember> {
    return this.prisma.channelMember.findFirst({
      where: {
        userId,
        channelId,
      },
    });
  }

  async isUserBanned(userId: number, channelId: number): Promise<boolean> {
    const channelMember = await this.prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
      },
      include: {
        user: true,
      },
    });
    if (!channelMember) return false;
    return channelMember.banned;
  }
}
