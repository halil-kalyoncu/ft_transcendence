import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createOne(message: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({
      data: message,
    });
  }
}
