import { Injectable } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { CreateChannelMessageDto } from '../../dto/create-channel-message.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage } from '@prisma/client';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class ChannelMessageService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private messageService: MessageService,
  ) {}

  async create(
    createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<ChannelMessage> {
    const { senderId, channelId, message } = createChannelMessageDto;
    const channel = await this.channelService.find(channelId);

    if (!channel) {
      throw new Error("Channel doesn't exists");
    }

    const member = await this.channelService.findMember(senderId, channelId);

    if (!member) {
      throw new Error('Member is not part of the channel');
    }

    const createdMessage = await this.messageService.createOne({ message });

    return this.prisma.channelMessage.create({
      data: {
        sender: { connect: { id: member.id } },
        message: { connect: { id: createdMessage.id } },
      },
      include: {
        sender: true,
        message: true,
      },
    });
  }

  async getGroupMessages(channelId: number): Promise<ChannelMessage[]> {
    const channel = await this.channelService.find(channelId);

    if (!channel) {
      throw new Error("Channel doesn't exists");
    }

    return this.prisma.channelMessage.findMany({
      where: {
        sender: { channelId },
      },
      include: {
        sender: true,
        message: true,
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
  }
}
