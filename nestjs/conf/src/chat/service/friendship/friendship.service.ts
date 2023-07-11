import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FriendshipEntity,
  FriendshipStatus,
} from '../../../chat/model/friendship/friendship.entity';
import { FriendshipI } from '../../../chat/model/friendship/friendship.interface';
import { Repository } from 'typeorm';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(FriendshipEntity)
    private readonly friendshipRepository: Repository<FriendshipEntity>,
  ) {}

  async create(friendship: FriendshipI): Promise<FriendshipI> {
    return this.friendshipRepository.save(
      this.friendshipRepository.create(friendship),
    );
  }

  /*
SELECT "user"."id", "user"."username"
FROM "user_entity" AS "user"
JOIN "friendship_entity" AS "friendship" ON "friendship"."senderId" = "user"."id" OR "friendship"."receiverId" = "user"."id" 
WHERE "friendship"."status" = 'accepted'
AND ("friendship"."senderId" = '1' OR "friendship"."receiverId" = '1')
AND "user"."id" != '1'
*/
  async getFriends(userId: number): Promise<UserI[]> {
    const friends = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .leftJoinAndSelect('friendship.sender', 'sender')
      .leftJoinAndSelect('friendship.receiver', 'receiver')
      .where(
        'friendship.senderId = :user_id OR friendship.receiverId = :user_id',
        { user_id: userId },
      )
      .andWhere('friendship.status = :status', {
        status: FriendshipStatus.Accepted,
      })
      .getMany();

    const friendsArray = friends.map((friendship) => {
      if (friendship.sender.id === userId) {
        return friendship.receiver;
      } else {
        return friendship.sender;
      }
    });

    return friendsArray;
  }
}
