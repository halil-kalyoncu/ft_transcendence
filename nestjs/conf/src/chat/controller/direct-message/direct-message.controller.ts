import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { DirectMessageService } from '../../service/direct-message/direct-message.service';
import { DirectMessage, User } from '@prisma/client';
import { DirectConverstationDto } from '../../dto/direct-conversation.dto';
import { UnreadMessagesDto } from '../../dto/unread-messages.dto';

@Controller('directMessages')
export class DirectMessageController {

    constructor(
        private directMessageService: DirectMessageService,
    ) {}

    @Get()
    async getDirectMessages(@Body() directConversationDto: DirectConverstationDto): Promise<DirectMessage[]> {
        return this.directMessageService.getConversation(directConversationDto.readerUserId, directConversationDto.withUserId);
    }

    // @Get('allUnreadByUserId')
    // async getAllUnreadDirectMessages(@Query('userId', ParseIntPipe) userId: number): Promise<DirectMessage[]> {
    //     return this.directMessageService.getAllUnreadMessages(userId);
    // }

    @Get('allUnreadByUserId')
    async getAllUnreadDirectMessages(@Query('userId', ParseIntPipe) userId: number): Promise<UnreadMessagesDto[]> {
        const unreadMessages = await this.directMessageService.getAllUnreadMessages(userId);
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
        return (result);
    }

    @Post('markAsRead')
    async markMessagesAsRead(@Body() directConversationDto: DirectConverstationDto): Promise<DirectMessage[]> {
        return this.directMessageService.markConversationAsRead(directConversationDto.readerUserId, directConversationDto.withUserId);
    }

}
