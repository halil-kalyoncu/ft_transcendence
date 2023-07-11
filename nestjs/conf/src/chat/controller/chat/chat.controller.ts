import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FriendshipService } from 'src/chat/service/friendship/friendship.service';
import { UserI } from 'src/user/model/user.interface';

@Controller('chat')
export class ChatController {
  constructor(private friendshipService: FriendshipService) {}

  @Get('friendship')
  async findAllFriendsByUserId(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UserI[]> {
    return this.friendshipService.getFriends(userId);
  }
}
