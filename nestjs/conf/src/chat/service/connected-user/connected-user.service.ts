import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUser, Prisma, User } from '@prisma/client';

@Injectable()
export class ConnectedUserService {
  constructor(private prisma: PrismaService) {}

  async create(
    connectedUser: Prisma.ConnectedUserCreateInput,
  ): Promise<ConnectedUser> {
    return this.prisma.connectedUser.create({
      data: connectedUser,
    });
  }

  async getAll(): Promise<ConnectedUser[]> {
    return this.prisma.connectedUser.findMany();
  }

  async findByUserId(userId: number): Promise<ConnectedUser | null> {
    return this.prisma.connectedUser.findFirst({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async findByUser(user: User): Promise<ConnectedUser | null> {
    return this.prisma.connectedUser.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });
  }

  async deleteBySocketId(socketId: string): Promise<ConnectedUser> {
    const user = await this.prisma.connectedUser.findUnique({
      where: { socketId: socketId },
    });
    if (user) {
      return this.prisma.connectedUser.delete({
        where: {
          socketId,
        },
      });
    } else return null;
  }

  async deleteAll() {
    return this.prisma.connectedUser.deleteMany();
  }
}
