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
}