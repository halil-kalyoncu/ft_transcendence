import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  Channel,
  ChannelMember,
  ChannelVisibility,
  Prisma,
  UserRole,
} from '@prisma/client';
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

  async createChannel({
    userId,
    name,
    password,
    channelVisibility,
  }: {
    userId: number;
    name: string;
    password?: string;
    channelVisibility: ChannelVisibility;
  }): Promise<Channel> {
    const channel = await this.prisma.channel.create({
      data: {
        name: name,
        password: password,
        ownerId: userId,
        visibility: channelVisibility,
      },
    });

    await this.prisma.channelMember.create({
      data: {
        userId: userId,
        channelId: channel.id,
        role: UserRole.OWNER,
      },
    });

    return channel;
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

  async joinChannel(userId: number, channelId: number): Promise<ChannelMember> {
    const existingMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId,
        },
      },
    });

    if (existingMembership) {
      throw new Error('You are already a member of this channel.');
    }

    return this.prisma.channelMember.create({
      data: {
        userId: userId,
        channelId: channelId,
        role: UserRole.MEMBER,
      },
    });
  }

  async leaveChannel(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const member = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId,
        },
      },
    });

    if (!member) {
      throw new Error('User is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: userId,
          channelId: channelId,
        },
      },
    });
  }

  async makeAdmin(
    ownerId: number,
    targetUserId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.ownerId !== ownerId) {
      throw new Error(
        'Only the owner of the channel can make a user an admin.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
      data: {
        role: UserRole.ADMIN,
      },
    });
  }

  async kickChannelMember(
    requesterId: number,
    targetUserId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: requesterId,
          channelId: channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== requesterId &&
        requesterMembership?.role !== UserRole.ADMIN) ||
      requesterMembership?.role !== UserRole.OWNER
    ) {
      throw new Error(
        'Only the owner or an admin can kick a user from the channel.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
    });
  }

  async banChannelMember(
    requesterId: number,
    targetUserId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: requesterId,
          channelId: channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== requesterId &&
        requesterMembership?.role !== UserRole.ADMIN)
    ) {
      throw new Error(
        'Only the owner or an admin can ban a user from the channel.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
      data: {
        banned: true,
      },
    });
  }

  async muteUser(
    requesterId: number,
    targetUserId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: requesterId,
          channelId: channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== requesterId &&
        requesterMembership?.role !== UserRole.ADMIN)
    ) {
      throw new Error(
        'Only the owner or an admin can mute a user in the channel.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    const unmuteAt = new Date();
    unmuteAt.setMinutes(unmuteAt.getMinutes() + 5);

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: channelId,
        },
      },
      data: {
        unmuteAt: unmuteAt,
      },
    });
  }
}
