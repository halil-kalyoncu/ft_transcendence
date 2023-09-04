import { Injectable } from '@nestjs/common';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Friendship, FriendshipStatus, Prisma, User } from '@prisma/client';
import { FriendshipDto, FriendshipEntryStatus } from '../../dto/friendship.dto';
import { MatchService } from '../../../match/service/match.service';

@Injectable()
export class FriendshipService {
  constructor(
    private prisma: PrismaService,
    private connectedUserService: ConnectedUserService,
    private matchService: MatchService,
  ) {}

  async create(friendship: Prisma.FriendshipCreateInput): Promise<Friendship> {
    const checkFriendship: Friendship = await this.find(
      friendship.sender.connect.id,
      friendship.receiver.connect.id,
    );

    if (checkFriendship) {
      if (checkFriendship.status === FriendshipStatus.PENDING) {
        throw new Error('Already send a request');
      } else if (checkFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new Error('Already friends');
      }
      // else if (checkFriendship.status === FriendshipStatus.BLOCKED) {
      //   throw new Error(
      //     'Please check if the user is in your blocked list. Otherwise you have been blocked :(',
      //   );
      // }
      else if (checkFriendship.status === FriendshipStatus.REJECTED) {
        await this.remove(checkFriendship.id);
      }
    }
    return this.prisma.friendship.create({
      data: friendship,
    });
  }

  async find(userId1: number, userId2: number): Promise<Friendship | null> {
    return await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: { sender: true, receiver: true },
    });
  }

  async getFriends(userId: number): Promise<FriendshipDto[]> {
    const friends = await this.prisma.friendship.findMany({
      where: {
        AND: [
          { status: FriendshipStatus.ACCEPTED },
          {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
        ],
      },
      include: { sender: true, receiver: true },
    });

    const friendshipEntries: FriendshipDto[] = await Promise.all(
      friends.map(async (friendship) => {
        const id = friendship.id;
        const friend =
          friendship.senderId === userId
            ? friendship.receiver
            : friendship.sender;

        let status = FriendshipEntryStatus.Offline;
        const inGame = await this.matchService.isInGame(friend.id);
        const isConnected = await this.connectedUserService.findByUser(friend);
        if (inGame) {
          status = FriendshipEntryStatus.Ingame;
        } else if (isConnected) {
          status = FriendshipEntryStatus.Online;
        }
        return { id, friend, status };
      }),
    );

    friendshipEntries.sort((a, b) => {
      if (
        (a.status === FriendshipEntryStatus.Online ||
          a.status === FriendshipEntryStatus.Ingame) &&
        b.status === FriendshipEntryStatus.Offline
      ) {
        return -1;
      } else if (
        a.status === FriendshipEntryStatus.Offline &&
        (b.status === FriendshipEntryStatus.Online ||
          b.status === FriendshipEntryStatus.Ingame)
      ) {
        return 1;
      } else {
        return 0;
      }
    });

    return friendshipEntries;
  }

  async getFriendRequests(userId: number): Promise<FriendshipDto[]> {
    const requests = await this.prisma.friendship.findMany({
      where: {
        AND: [{ receiverId: userId }, { status: FriendshipStatus.PENDING }],
      },
      include: { sender: true },
    });

    const requestEntries: FriendshipDto[] = await Promise.all(
      requests.map(async (request) => {
        const id = request.id;
        const sender = request.sender;
        return { id, friend: sender, status: FriendshipEntryStatus.Offline };
      }),
    );

    return requestEntries;
  }

  async acceptFriendshipRequest(
    friendshipId: number,
  ): Promise<Friendship | null> {
    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
      include: { sender: true, receiver: true },
    });
  }

  async rejectFriendshipRequest(
    friendshipId: number,
  ): Promise<Friendship | null> {
    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.REJECTED },
      include: { sender: true, receiver: true },
    });
  }

  // async block(friendship: Prisma.FriendshipCreateInput): Promise<Friendship> {
  //   const checkFriendship: Friendship = await this.find(
  //     friendship.sender.connect.id,
  //     friendship.receiver.connect.id,
  //   );
  //   if (checkFriendship) {
  //     this.remove(checkFriendship.id);
  //   }
  //   friendship.status = FriendshipStatus.BLOCKED;
  //   return this.prisma.friendship.create({
  //     data: friendship,
  //   });
  // }

  // async unblock(userId: number, blockedUserId: number): Promise<Friendship> {
  //   const friendship = await this.find(userId, blockedUserId);
  //   if (!friendship || friendship.status !== FriendshipStatus.BLOCKED) {
  //     throw new Error('User is not in your blocked list');
  //   }
  //   return await this.remove(friendship.id);
  // }

  // async getBlockedUsers(userId: number): Promise<Friendship[]> {
  //   return await this.prisma.friendship.findMany({
  //     where: {
  //       AND: [
  //         { status: FriendshipStatus.BLOCKED },
  //         {
  //           OR: [{ senderId: userId }, { receiverId: userId }],
  //         },
  //       ],
  //     },
  //     include: { sender: true, receiver: true },
  //   });
  // }

  async remove(friendshipId: number): Promise<Friendship> {
    return await this.prisma.friendship.delete({ where: { id: friendshipId } });
  }

  async getOne(friendshipId: number): Promise<Friendship | null> {
    return this.prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: { sender: true, receiver: true },
    });
  }
}
