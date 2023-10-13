import { Injectable } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { CreateDirectMessageDto } from '../../dto/create-direct-message.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { DirectMessage } from '@prisma/client';

@Injectable()
export class DirectMessageService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}

  async create(
    createDirectMessageDto: CreateDirectMessageDto,
  ): Promise<DirectMessage> {
    const { senderId, receiverId, message } = createDirectMessageDto;
    const createdMessage = await this.messageService.createOne({ message });

    return this.prisma.directMessage.create({
      data: {
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        message: { connect: { id: createdMessage.id } },
      },
      include: {
        sender: true,
        receiver: true,
        message: true,
      },
    });
  }

  async getConversation(
    userId1: number,
    userId2: number,
  ): Promise<DirectMessage[]> {
    return await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: true,
        receiver: true,
        message: true,
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
  }

  async getUnreadMessages(
    readerUserId: number,
    withUserId: number,
  ): Promise<DirectMessage[]> {
    return this.prisma.directMessage.findMany({
      where: {
        receiverId: readerUserId,
        senderId: withUserId,
        isRead: false,
      },
      include: {
        sender: true,
        receiver: true,
        message: true,
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
  }

  async getAllUnreadMessages(userId: number): Promise<DirectMessage[]> {
    return this.prisma.directMessage.findMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      include: {
        sender: true,
        receiver: true,
        message: true,
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
  }

  async markConversationAsRead(
    readerUserId: number,
    withUserId: number,
  ): Promise<DirectMessage[]> {
    const directMessages = await this.prisma.directMessage.updateMany({
      where: {
        senderId: withUserId,
        receiverId: readerUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return this.getConversation(readerUserId, withUserId);
  }
}
