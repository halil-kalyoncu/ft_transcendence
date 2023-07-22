import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel, Prisma } from '@prisma/client';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ConnectedUserService))
    private connectedUserService: ConnectedUserService,
  ) {}

  async create(channel: Prisma.ChannelCreateInput): Promise<Channel> {
    return this.prisma.channel.create({
      data: channel,
    });
  }

  async setPassword(
    channelId: number,
    userId: number,
    password: string,
  ): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { owner: true },
    });

    if (!channel || channel.ownerId !== userId) {
      throw new Error('Only the owner of the channel can set the password.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.channel.update({
      where: { id: channelId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async deletePassword(channelId: number, userId: number): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { owner: true },
    });

    if (!channel || channel.ownerId !== userId) {
      throw new Error('Only the owner of the channel can delete the password.');
    }

    return this.prisma.channel.update({
      where: { id: channelId },
      data: {
        password: null,
      },
    });
  }

}
