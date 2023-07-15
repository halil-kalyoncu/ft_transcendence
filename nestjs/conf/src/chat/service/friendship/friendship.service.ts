import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FriendshipEntity,
  FriendshipStatus,
} from '../../../chat/model/friendship/friendship.entity';
import { FriendshipI } from '../../../chat/model/friendship/friendship.interface';
import { Repository } from 'typeorm';
import { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface';
import { ConnectedUserService } from '../connected-user/connected-user.service';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,
    private connectedUserService: ConnectedUserService,
  ) {}

  async create(friendship: FriendshipI): Promise<FriendshipI> {
    return this.friendshipRepository.save(
      this.friendshipRepository.create(friendship),
    );
  }

  async findOne(userId1: number, userId2: number): Promise<FriendshipI> {
    return await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where(
        '( (friendship.senderId = :user_id1 AND friendship.receiverId = :user_id2) OR (friendship.senderId = :user_id2 AND friendship.receiverId = :user_id1) ) ',
        { user_id1: userId1, user_id2: userId2 },
      )
      .getOne();
  }

  async getFriends(userId: number): Promise<FriendshipEntryI[]> {
    const friends = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where(
        '(friendship.senderId = :user_id OR friendship.receiverId = :user_id)',
        { user_id: userId },
      )
      .andWhere('friendship.status = :status', {
        status: FriendshipStatus.Accepted,
      })
      .getMany();

    const friendshipEntries = await Promise.all(
      friends.map(async (friendship) => {
        const id = friendship.id;
        const friend =
          friendship.sender.id === userId
            ? friendship.receiver
            : friendship.sender;
        const isConnected = await this.connectedUserService.findByUser(friend);
        return { id, friend, isOnline: !!isConnected };
      }),
    );

    friendshipEntries.sort((a, b) => {
      if (a.isOnline && !b.isOnline) {
        return -1;
      } else if (!a.isOnline && b.isOnline) {
        return 1;
      } else {
        return 0;
      }
    });

    return friendshipEntries;
  }

  async getFriendRequests(userId: number): Promise<FriendshipEntryI[]> {
    const requests = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('friendship.receiverId = :user_id', { user_id: userId })
      .andWhere('friendship.status = :status', {
        status: FriendshipStatus.Pending,
      })
      .getMany();

    const requestEntries = await Promise.all(
      requests.map(async (request) => {
        const id = request.id;
        const sender = request.sender;
        return { id, friend: sender };
      }),
    );

    return requestEntries;
  }

  async acceptFriendshipRequest(
    friendshipId: number,
  ): Promise<FriendshipI | null> {
    const friendship = await this.getOne(friendshipId);

    if (!friendship) {
      return null;
    }

    friendship.status = FriendshipStatus.Accepted;
    return await this.friendshipRepository.save(friendship);
  }

  async rejectFriendshipRequest(
    friendshipId: number,
  ): Promise<FriendshipI | null> {
    const friendship = await this.getOne(friendshipId);

    if (!friendship) {
      return null;
    }

    friendship.status = FriendshipStatus.Rejected;
    return await this.friendshipRepository.save(friendship);
  }

  async remove(friendshipId: number) {
    const friendship = await this.getOne(friendshipId);

    if (!friendship) {
      throw new Error('Frienship not found');
    }
    await this.friendshipRepository.delete(friendshipId);
  }

  async getOne(friendshipId: number): Promise<FriendshipI | null> {
    return await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where('friendship.id = :friendshipId', { friendshipId })
      .getOne();
  }
}
