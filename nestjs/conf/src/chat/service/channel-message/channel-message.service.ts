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
} from '@prisma/client';
import { ChannelService } from '../channel/channel.service';
import { ChannelMemberService } from '../channel-member/channel-member.service';

@Injectable()
export class ChannelMessageService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private messageService: MessageService,
    private channelMemberService: ChannelMemberService,
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
    };

    // Create a ChannelMessageReadStatus for each member of the channel
    const channelMembers = await this.channelService.findMembers(channelId);
    for (const channelMember of channelMembers) {
      await this.prisma.channelMessageReadStatus.create({
        data: {
          message: { connect: { id: createdMessage.id } },
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
	  /* TODO: DELTE IF NOT NEEDED 
	  const filteredChannelMessages = channelMessages.map((message) =>{
		const {sender} = message;

		if (sender.status === 'MUTED') {
			return null;
		}

		const roleSinceDate = new Date(sender.roleSince);
		const createdAtDate = new Date(message.message.createdAt);
		if (roleSinceDate > createdAtDate) {
			return null;
		}
		return message;
	  }).filter(Boolean)
 */
	  console.log('channelMessages', channelMessages)
      const channelMessageDtos: ChannelMessageDto[] = channelMessages.map(
        (channelMessage) => ({
          id: channelMessage.id,
          message: channelMessage.message,
          sender: channelMessage.sender.user,
          createdAt: channelMessage.message.createdAt,
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
      return await this.getChannelMessagesforChannel(channelId);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async getUnreadStatus(
    channelId: number,
    userId: number,
  ): Promise<ChannelMessageReadStatus[]> {
    try {
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
      console.log('unreadMessages', unreadMessages);
      return unreadMessages;
    } catch (error) {
      // Handle errors appropriately
      throw new Error('Error fetching unread messages: ' + error.message);
    }
  }

  
}
