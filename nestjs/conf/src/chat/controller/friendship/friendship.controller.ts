import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendshipDto } from '../../dto/friendship.dto';
import { ApiTags } from '@nestjs/swagger';
import { FriendshipService } from '../../service/friendship/friendship.service';
import { Friendship, User } from '@prisma/client';
import { BlockUserDto } from '../../dto/block-user.dto';
import { ErrorDto } from '../../dto/error.dto';

@ApiTags('Friendship (Chat module)')
@Controller('friendships')
export class FriendshipController {
  constructor(private friendshipService: FriendshipService) {}

  //GET Friends from the db where the status is accepted based on the userId given as a URL from the frontend
  @Get('get-accepted-friends')
  async getAcceptedFriends(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<FriendshipDto[]> {
    return await this.friendshipService.getFriends(userId);
  }

  //GET friends from the db where the status is pending based o the userId given as a URL from the frontend
  @Get('get-friend-requests')
  async getFriendRequests(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<FriendshipDto[]> {
    return await this.friendshipService.getFriendRequests(userId);
  }

  @Get('get-like-username')
  async getFriendsLikeUsername(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('username') searchTerm: string,
  ): Promise<User[]> {
    return await this.friendshipService.listFriendsLikeUsername(
      userId,
      searchTerm,
    );
  }

  // @Get('blocked-users')
  // async getBlockedUsers(
  //   @Query('userId', ParseIntPipe) userId: number,
  // ): Promise<Friendship[]> {
  //   return this.friendshipService.getBlockedUsers(userId);
  // }

  // @Post('unblock-user')
  // async unblockUser(
  //   @Body() unblockUserDto: UnblockUserDto,
  // ): Promise<Friendship | ErrorDto> {
  //   try {
  //     return this.friendshipService.unblock(
  //       unblockUserDto.userId,
  //       unblockUserDto.unblockUserId,
  //     );
  //   } catch (error) {
  //     return { error: error.message };
  //   }
  // }
}
