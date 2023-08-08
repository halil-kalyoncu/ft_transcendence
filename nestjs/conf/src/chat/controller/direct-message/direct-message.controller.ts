import { Body, Controller, Get } from '@nestjs/common';
import { DirectMessageService } from '../../service/direct-message/direct-message.service';
import { DirectMessage } from '@prisma/client';
import { GetDirectMessagesDto } from '../../dto/get-direct-message.dto';
import { UserService } from '../../../user/service/user-service/user.service';

@Controller('directMessages')
export class DirectMessageController {

    constructor(
        private directMessageService: DirectMessageService,
        private userService: UserService
    ) {}

    @Get()
    async getDirectMessages(@Body() getDirectMessagesDto: GetDirectMessagesDto): Promise<DirectMessage[]> {
        await this.userService.
        return this.directMessageService.getConversation(getDirectMessagesDto.userId1, getDirectMessagesDto.userId2);
    }

}
