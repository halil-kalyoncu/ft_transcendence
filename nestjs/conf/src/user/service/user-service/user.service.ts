import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtAuthService: JwtAuthService,
  ) {}

  //remove this, if 42 login works
  async login(user: Prisma.UserCreateInput): Promise<string> {
    let foundUser: User | null = await this.findByUsername(user.username);

    if (!foundUser) {
      foundUser = await this.create(user);
    }
    return this.jwtAuthService.generateJwt(foundUser);
  }

  async create(newUser: Prisma.UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: newUser,
      });
      return this.findById(user.id);
    } catch {
      throw new HttpException(
        'Username is already in use',
        HttpStatus.CONFLICT,
      );
    }
  }

  async findById(id: number): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        blockedUsers: true
      }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findAllByUsername(username: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: number): Promise<User> {
    const user: User = await this.findById(userId);

    if (!user) {
      throw new Error('user not found');
    }

    if (user.avatarId) {
      fs.unlinkSync(user.avatarId);
    }

    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarId: file.path,
      },
    });
  }

  async deleteAvatar(userId: number) {
    const user: User = await this.findById(userId);

    if (!user) {
      throw new Error('user not found');
    }

    if (user.avatarId) {
      fs.unlinkSync(user.avatarId);
    }
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: null,
      },
    });
  }

  async setTwoFactorAuthSecret(userId: number, secret: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        secret2FA: secret,
      },
    });
  }

  async turnOnTwoFactorAuth(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        enabled2FA: true,
      },
    });
  }
}
