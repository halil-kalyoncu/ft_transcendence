import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User, ChannelInvitationStatus } from '@prisma/client';
import { DirectMessageService } from '../../../chat/service/direct-message/direct-message.service';
import { ChannelInviteeUserDto } from '../../../chat/dto/channelInvitation.dto';
import * as fs from 'fs';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtAuthService: JwtAuthService,
    private connectedUser: ConnectedUserService,
  ) {}

  //remove this, if 42 login works
  async login(user: Prisma.UserCreateInput): Promise<string> {
    let foundUser: User | null = await this.findByUsername(user.username);

    if (!foundUser) {
      foundUser = await this.create(user);
    } else {
      const connectedUser = await this.connectedUser.findByUserId(foundUser.id);
      if (connectedUser) {
        throw new ConflictException(
          'User ' + foundUser.username + ' is already logged in',
        );
      }
    }
    return await this.jwtAuthService.generateJwt(foundUser);
  }

  async register(userInput: Prisma.UserCreateInput): Promise<string> {
    console.log('register service');
    let user: User | null = await this.findByUsername(userInput.username);

    if (user) {
      throw new ConflictException(
        'Username ' + user.username + ' is already used',
      );
    }
    user = await this.prisma.user.update({
      where: {
        intraLogin: userInput.intraLogin,
      },
      data: {
        username: userInput.username,
      },
    });

    console.log(user);
    if (!user || !user.username) {
      console.log(':(');
      throw new InternalServerErrorException();
    }
    return await this.jwtAuthService.generateJwt(user);
  }

  async create(newUser: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: newUser,
      });
    } catch (error) {
      //P2002 is the prisma error code for the unique constraint
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Username ${newUser.username} is already in use`,
        );
      }
      throw error;
    }
  }

  async findById(id: number): Promise<any | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        blockedUsers: true,
      },
    });
  }

  async findByIntraLogin(intraLogin: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { intraLogin },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findAllByUsername(username: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
    });
  }
  async findUsersNotInChannel(
    channelId: number,
  ): Promise<ChannelInviteeUserDto[]> {
    const channelInvitees: ChannelInviteeUserDto[] = [];
    const usersNotInChannel = await this.prisma.user.findMany({
      where: {
        NOT: {
          ChannelMember: {
            some: {
              channelId: channelId,
            },
          },
        },
      },
      include: {
        inviteeforChannels: true,
      },
    });

    for (const user of usersNotInChannel) {
      const status = await this.prisma.channelInvitation.findMany({
        where: {
          inviteeId: user.id,
          channelId: channelId,
        },
        select: {
          status: true,
        },
      });
      const channelinvitee = {
        id: user.id,
        username: user.username,
        status: (status[0]?.status as ChannelInvitationStatus) || null,
      };
      channelInvitees.push(channelinvitee);
    }
    return channelInvitees;
  }

  async uploadAvatar(file: Express.Multer.File, userId: number): Promise<User> {
    const user: User = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarId) {
      fs.unlinkSync(this.generateAvatarPath(user.avatarId));
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarId: file.filename,
      },
    });
  }

  async deleteAvatar(userId: number) {
    const user: User = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarId) {
      fs.unlinkSync(this.generateAvatarPath(user.avatarId));
    }
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: null,
      },
    });
  }

  async setTwoFactorAuthSecret(userId: number, secret: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        secret2FA: secret,
      },
    });
  }

  async turnOnTwoFactorAuth(userId: number): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        enabled2FA: true,
      },
    });
  }

  async turnOffTwoFactorAuth(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        enabled2FA: false,
        secret2FA: null,
      },
    });
  }

  async twoFAstatus(userId: number): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.enabled2FA;
  }

  private generateAvatarPath(avatarId: string): string {
    return process.env.AVATARPATH + '/' + avatarId;
  }
}
