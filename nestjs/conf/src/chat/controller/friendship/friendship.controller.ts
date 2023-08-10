import { Body, Controller, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { FriendshipDto } from '../../dto/friendship.dto';
import { ApiTags } from '@nestjs/swagger';
import { FriendshipService } from '../../service/friendship/friendship.service';


@ApiTags('Friendship module')
@Controller('friendships')
export class FriendshipController {
    constructor(
        private friendshipService: FriendshipService,
    ) {}

    //GET Friends from the db where the status is accepted based on the userId given as a URL from the frontend
    @Get('get-accepted-friends')
    async getAcceptedFriends(@Query('userId', ParseIntPipe) userId: number): Promise<FriendshipDto[]> {
        return this.friendshipService.getFriends(userId);
    }
    //GET friends from the db where the status is pending based o the userId given as a URL from the frontend
    @Get('get-friend-requests')
    async getFriendRequests(@Query('userId', ParseIntPipe) userId: number): Promise<FriendshipDto[]> {
        return this.friendshipService.getFriendRequests(userId);
    }
}
