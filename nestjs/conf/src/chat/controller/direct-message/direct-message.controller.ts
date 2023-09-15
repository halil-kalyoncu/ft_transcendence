import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { DirectMessageService } from '../../service/direct-message/direct-message.service';
import { BlockedUser, DirectMessage, User } from '@prisma/client';
import { DirectConverstationDto } from '../../dto/direct-conversation.dto';
import { UnreadMessagesDto } from '../../dto/unread-messages.dto';
import { ApiTags } from '@nestjs/swagger';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';

@ApiTags('Direct message (Chat module)')
@Controller('directMessages')
export class DirectMessageController {
  constructor(
    private directMessageService: DirectMessageService,
    private blockedUserService: BlockedUserService
  ) {}

  //Get all the directMessages between two users with the messages and the participants (receiver and sender) from the message table
  // Needs the readerUserId and the withUserId as a URL from the frontend, may be changed in the future
  @Get('getDirectMessages')
  async getDirectMessages(
    @Query('readerUserId', ParseIntPipe) readerUserId: number,
    @Query('withUserId', ParseIntPipe) withUserId: number,
  ): Promise<DirectMessage[] | { blocked: string }> {
    const blockedUser: BlockedUser = await this.blockedUserService.find(readerUserId, withUserId);
    if (blockedUser) {
      return { blocked: 'this conversation is blocked' }
    }
    return await this.directMessageService.getConversation(readerUserId, withUserId);
  }

  // @Get('allUnreadByUserId')
  // async getAllUnreadDirectMessages(@Query('userId', ParseIntPipe) userId: number): Promise<DirectMessage[]> {
  //     return this.directMessageService.getAllUnreadMessages(userId);
  // }

  //Get all the unread messages from the db based on the userId given as a URL from the frontend
  @Get('allUnreadByUserId')
  async getAllUnreadDirectMessages(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UnreadMessagesDto[]> {
    const unreadMessages = await this.directMessageService.getAllUnreadMessages(
      userId,
    );
    const groupMessagesBySender: { [senderId: number]: DirectMessage[] } = {};
    const result: UnreadMessagesDto[] = [];

    for (const message of unreadMessages) {
      const senderId = message.senderId;
      const blockedUser: BlockedUser = await this.blockedUserService.find(userId, senderId);
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
  }

  @Post('markAsRead')
  async markMessagesAsRead(
    @Body() directConversationDto: DirectConverstationDto,
  ): Promise<DirectMessage[]> {
    const blockedUser: BlockedUser = await this.blockedUserService.find(directConversationDto.readerUserId, directConversationDto.withUserId);
    if (blockedUser) {
      return []
    }
    return await this.directMessageService.markConversationAsRead(
      directConversationDto.readerUserId,
      directConversationDto.withUserId,
    );
  }
}
