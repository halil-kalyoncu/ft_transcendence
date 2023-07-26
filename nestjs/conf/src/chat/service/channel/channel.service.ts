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
import * as bcrypt from 'bcryptjs';
import {
  SetPasswordDto,
  DeletePasswordDto,
  CreateChannelDto,
  ChannelMembershipDto,
  AdminActionDto,
} from '../../dto/channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ConnectedUserService))
    private connectedUserService: ConnectedUserService,
  ) {}

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
    const existingChannel = await this.prisma.channel.findFirst({
      where: { name: name },
    });

    if (existingChannel) {
      throw new Error('Channel name already exists');
    }

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

  async setPassword(setPasswordDto: SetPasswordDto): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: setPasswordDto.channelId },
      include: { owner: true },
    });

    if (!channel || channel.ownerId !== setPasswordDto.userId) {
      throw new Error('Only the owner of the channel can set the password.');
    }

    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);

    return this.prisma.channel.update({
      where: { id: setPasswordDto.channelId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async deletePassword(deletePasswordDto: DeletePasswordDto): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: deletePasswordDto.channelId },
      include: { owner: true },
    });

    if (!channel || channel.ownerId !== deletePasswordDto.userId) {
      throw new Error('Only the owner of the channel can delete the password.');
    }

    return this.prisma.channel.update({
      where: { id: deletePasswordDto.channelId },
      data: {
        password: null,
      },
    });
  }

  async joinChannel(
    channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    const existingMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: channelMembershipDto.userId,
          channelId: channelMembershipDto.channelId,
        },
      },
    });

    if (existingMembership) {
      throw new Error('You are already a member of this channel.');
    }

    return this.prisma.channelMember.create({
      data: {
        userId: channelMembershipDto.userId,
        channelId: channelMembershipDto.channelId,
        role: UserRole.MEMBER,
      },
    });
  }

  async leaveChannel(
    channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    const member = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: channelMembershipDto.userId,
          channelId: channelMembershipDto.channelId,
        },
      },
    });

    if (!member) {
      throw new Error('User is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: channelMembershipDto.userId,
          channelId: channelMembershipDto.channelId,
        },
      },
    });
  }

  async makeAdmin(adminActionDto: AdminActionDto): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: adminActionDto.channelId },
    });

    if (!channel || channel.ownerId !== adminActionDto.requesterId) {
      throw new Error(
        'Only the owner of the channel can make a user an admin.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        role: UserRole.ADMIN,
      },
    });
  }

  async kickChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: adminActionDto.channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.requesterId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== adminActionDto.requesterId &&
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
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
    });
  }

  async banChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: adminActionDto.channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.requesterId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== adminActionDto.requesterId &&
        requesterMembership?.role !== UserRole.ADMIN)
    ) {
      throw new Error(
        'Only the owner or an admin can ban a user from the channel.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        banned: true,
      },
    });
  }

  async muteChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: adminActionDto.channelId },
    });

    const requesterMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.requesterId,
          channelId: adminActionDto.channelId,
        },
      },
    });

    if (
      !channel ||
      (channel.ownerId !== adminActionDto.requesterId &&
        requesterMembership?.role !== UserRole.ADMIN)
    ) {
      throw new Error(
        'Only the owner or an admin can mute a user in the channel.',
      );
    }

    const targetMembership = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
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
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        unmuteAt: unmuteAt,
      },
    });
  }
}
