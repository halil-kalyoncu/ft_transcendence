import { Injectable } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { CreateChannelMessageDto } from '../../dto/create-channel-message.dto';
import { ChannelMessageDto } from '../../dto/channel.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ChannelMessage,
  Message,
  User,
  Channel,
  ChannelMember,
  ChannelMessageReadStatus,
  BlockedUser,
} from '@prisma/client';
import { ChannelService } from '../channel/channel.service';
import { ChannelMemberService } from '../channel-member/channel-member.service';
import { BlockedUserService } from '../blocked-user/blocked-user.service';

@Injectable()
export class ChannelMessageService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private messageService: MessageService,
    private channelMemberService: ChannelMemberService,
    private blockedUserService: BlockedUserService,
  ) {}

  async create(
    createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<ChannelMessage> {
    const { senderId, channelId, message } = createChannelMessageDto;

    const channel = await this.channelService.find(channelId);

    if (!channel) {
      throw new Error("Channel doesn't exist");
    }

    const member = await this.channelService.findMember(senderId, channelId);

    if (!member) {
      throw new Error('Member is not part of the channel');
    }

    const createdMessage = await this.messageService.createOne({ message });
    const createdChannelMessage = await this.prisma.channelMessage.create({
      data: {
        sender: { connect: { id: member.id } },
        message: { connect: { id: createdMessage.id } },
      },
      include: {
        sender: true,
        message: true,
      },
    });

    // Return the created ChannelMessage
    return createdChannelMessage;
  }

  async createChannelMessageI(
    createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
    const { senderId, channelId, message } = createChannelMessageDto;

    const channel = await this.channelService.find(channelId);

    if (!channel) {
      throw new Error("Channel doesn't exist");
    }

    const member = await this.channelService.findMember(senderId, channelId);

    if (!member) {
      throw new Error('Member is not part of the channel');
    }

    if (member.unmuteAt) {
      throw new Error('You are muted');
    }

    const createdMessage = await this.messageService.createOne({ message });
    const createdChannelMessage = await this.prisma.channelMessage.create({
      data: {
        sender: { connect: { id: member.id } },
        message: { connect: { id: createdMessage.id } },
      },
      include: {
        sender: {
          include: {
            user: true,
          },
        },
        message: true,
      },
    });

    // Create a ChannelMessageDto using the returned data
    const channelMessageDto: any = {
      id: createdChannelMessage.id,
      message: createdChannelMessage.message,
      sender: createdChannelMessage.sender.user,
      createdAt: createdChannelMessage.message.createdAt,
      blockGroupMessage: false,
    };
    // Create a ChannelMessageReadStatus for each member of the channel
    const channelMembers = await this.channelService.findMembers(channelId);

    for (const channelMember of channelMembers) {
      await this.prisma.channelMessageReadStatus.create({
        data: {
          message: { connect: { id: createdChannelMessage.id } },
          reader: { connect: { id: channelMember.id } },
          isRead: channelMember.userId === member.userId,
        },
      });
    }
    // Return the created ChannelMessage
    return channelMessageDto;
  }

  async getChannelMessagesforChannel(
    channelId: number,
    userId: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const channelMessages: any[] = await this.prisma.channelMessage.findMany({
        where: {
          sender: {
            channel: {
              id: channelId,
            },
          },
        },
        include: {
          message: true,
          sender: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          message: {
            createdAt: 'desc',
          },
        },
      });
      const blockedUsers: User[] = await this.blockedUserService.getUsers(
        userId,
      );
      const channelMessageDtos: ChannelMessageDto[] = await Promise.all(
        channelMessages.map(async (channelMessage) => {
          let blockGroupMessage: boolean = false;

          if (channelMessage.sender.userId !== userId) {
            const isSenderBlocked = blockedUsers.some(
              (blockedUser) => blockedUser.id === channelMessage.sender.userId,
            );

            if (isSenderBlocked) {
              blockGroupMessage = true;
            }
          }

          return {
            id: channelMessage.id,
            message: channelMessage.message,
            sender: channelMessage.sender.user,
            createdAt: channelMessage.message.createdAt,
            blockGroupMessage,
          };
        }),
      );
      return channelMessageDtos;
    } catch (error: any) {
      console.error('Error fetching channel messages:', error);
      throw error;
    }
  }

  async markChannelMessagesAsRead(
    channelId: number,
    userId: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const channelMember = await this.channelMemberService.find(
        channelId,
        userId,
      );
      if (!channelMember) {
        throw Error('user not in channel');
      }
      await this.prisma.channelMessageReadStatus.updateMany({
        where: {
          readerId: channelMember.id,
        },
        data: {
          isRead: true,
        },
      });
      return await this.getChannelMessagesforChannel(channelId, userId);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}
