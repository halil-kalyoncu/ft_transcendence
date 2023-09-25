import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DirectMessageService } from '../../service/direct-message/direct-message.service';
import { BlockedUser, DirectMessage } from '@prisma/client';
import { DirectConverstationDto } from '../../dto/direct-conversation.dto';
import { UnreadMessagesDto } from '../../dto/unread-messages.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { PrismaModel } from '../../../_gen/prisma-class';

@ApiTags('Direct message (Chat module)')
@Controller('directMessages')
export class DirectMessageController {
  constructor(
    private directMessageService: DirectMessageService,
    private blockedUserService: BlockedUserService,
  ) {}

  //Get all the directMessages between two users with the messages and the participants (receiver and sender) from the message table
  // Needs the readerUserId and the withUserId as a URL from the frontend, may be changed in the future
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all direct messages between two users' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of direct messages',
    type: PrismaModel.DirectMessage,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('getDirectMessages')
  async getDirectMessages(
    @Query('readerUserId', ParseIntPipe) readerUserId: number,
    @Query('withUserId', ParseIntPipe) withUserId: number,
  ): Promise<DirectMessage[]> {
    try {
      return await this.directMessageService.getConversation(
        readerUserId,
        withUserId,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get('allUnreadByUserId')
  // async getAllUnreadDirectMessages(@Query('userId', ParseIntPipe) userId: number): Promise<DirectMessage[]> {
  //     return this.directMessageService.getAllUnreadMessages(userId);
  // }

  //Get all the unread messages from the db based on the userId given as a URL from the frontend
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      "Return the number of messages that a user hasn't read yet from other users",
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of the unread messages amount',
    type: UnreadMessagesDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('allUnreadByUserId')
  async getAllUnreadDirectMessages(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UnreadMessagesDto[]> {
    try {
      const unreadMessages =
        await this.directMessageService.getAllUnreadMessages(userId);
      const groupMessagesBySender: { [senderId: number]: DirectMessage[] } = {};
      const result: UnreadMessagesDto[] = [];

      for (const message of unreadMessages) {
        const senderId = message.senderId;
        const blockedUser: BlockedUser = await this.blockedUserService.find(
          userId,
          senderId,
        );
        if (!blockedUser && !groupMessagesBySender[senderId]) {
          groupMessagesBySender[senderId] = [];
        }

        if (!blockedUser) {
          groupMessagesBySender[senderId].push(message);
        }
      }

      for (const senderId in groupMessagesBySender) {
        if (groupMessagesBySender.hasOwnProperty(senderId)) {
          const amountUnread = groupMessagesBySender[senderId].length;
          result.push({
            senderId: parseInt(senderId),
            amountUnread,
          });
        }
      }
      return result;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      "Return the number of messages that a user hasn't read yet from other users",
  })
  @ApiResponse({
    status: 201,
    description: 'Successful update of converstation to read',
    type: PrismaModel.DirectMessage,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Post('markAsRead')
  async markMessagesAsRead(
    @Body() directConversationDto: DirectConverstationDto,
  ): Promise<DirectMessage[]> {
    try {
      const blockedUser: BlockedUser = await this.blockedUserService.find(
        directConversationDto.readerUserId,
        directConversationDto.withUserId,
      );
      if (blockedUser) {
        return [];
      }
      return await this.directMessageService.markConversationAsRead(
        directConversationDto.readerUserId,
        directConversationDto.withUserId,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
