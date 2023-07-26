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
    loadCount: number,
  ): Promise<DirectMessage[]> {
    return this.prisma.directMessage.findMany({
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
      take: loadCount,
    });
  }
}
