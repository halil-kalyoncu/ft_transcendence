import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FriendshipDto } from '../../dto/friendship.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FriendshipService } from '../../service/friendship/friendship.service';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

@ApiTags('Friendship (Chat module)')
@Controller('friendships')
export class FriendshipController {
  constructor(private friendshipService: FriendshipService) {}

  //GET Friends from the db where the status is accepted based on the userId given as a URL from the frontend
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all friends of a user' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of friends',
    type: FriendshipDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('get-accepted-friends')
  async getAcceptedFriends(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<FriendshipDto[]> {
    try {
      return await this.friendshipService.getFriends(userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //GET friends from the db where the status is pending based o the userId given as a URL from the frontend
  @Get('get-friend-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all friendsrequests of a user' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of friendrequests',
    type: FriendshipDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  async getFriendRequests(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<FriendshipDto[]> {
    try {
      return await this.friendshipService.getFriendRequests(userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get-like-username')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all friends that have a similar username' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user suggestions',
    type: FriendshipDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  async getFriendsLikeUsername(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('username') searchTerm: string,
  ): Promise<User[]> {
    try {
      return await this.friendshipService.listFriendsLikeUsername(
        userId,
        searchTerm,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
