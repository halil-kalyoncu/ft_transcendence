import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FriendshipService } from '../../service/friendship/friendship.service';
import { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface';

@Controller('chat')
export class ChatController {
  constructor(private friendshipService: FriendshipService) {}

  @Get('friendship')
  async findAllFriendsByUserId(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<FriendshipEntryI[]> {
    return this.friendshipService.getFriends(userId);
  }
}
