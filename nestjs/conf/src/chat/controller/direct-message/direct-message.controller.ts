import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { DirectMessageService } from '../../service/direct-message/direct-message.service';
import { DirectMessage, User } from '@prisma/client';
import { DirectConverstationDto } from '../../dto/direct-conversation.dto';
import { UnreadMessagesDto } from '../../dto/unread-messages.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Direct message module')
@Controller('directMessages')
export class DirectMessageController {
  constructor(private directMessageService: DirectMessageService) {}

  //Get all the directMessages between two users with the messages and the participants (receiver and sender) from the message table
  // Needs the readerUserId and the withUserId as a URL from the frontend, may be changed in the future
  @Get('getDirectMessages')
  async getDirectMessages(
    @Query('readerUserId', ParseIntPipe) readerUserId: number,
    @Query('withUserId', ParseIntPipe) withUserId: number,
  ): Promise<DirectMessage[]> {
    return this.directMessageService.getConversation(readerUserId, withUserId);
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
      if (!groupMessagesBySender[senderId]) {
        groupMessagesBySender[senderId] = [];
      }
      groupMessagesBySender[senderId].push(message);
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
    return this.directMessageService.markConversationAsRead(
      directConversationDto.readerUserId,
      directConversationDto.withUserId,
    );
  }
}
