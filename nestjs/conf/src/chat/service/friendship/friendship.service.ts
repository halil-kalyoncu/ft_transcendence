import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipEntity } from '../../../chat/model/friendship/friendship.entity';
import { FriendshipI } from '../../../chat/model/friendship/friendship.interface';
import { Repository } from 'typeorm';

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
}
