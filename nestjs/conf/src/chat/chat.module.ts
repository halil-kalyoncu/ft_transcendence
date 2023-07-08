import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipEntity } from './model/friendship/friendship.entity';
import { FriendshipService } from './service/friendship/friendship.service';
import { UserModule } from 'src/user/user.module';
import { ChatroomEntity } from './model/chatroom/chatroom.entity';
import { DirectMessageEntity } from './model/messages/directMessage.entity';
import { GroupMessageEntity } from './model/messages/groupMessages.entity';
import { MessageEntity } from './model/messages/message.entity';
import { UserChatroomEntity } from './model/chatroom/user-chatroom.entity';

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([
			FriendshipEntity,
			ChatroomEntity,
			UserChatroomEntity,
			DirectMessageEntity,
			GroupMessageEntity,
			MessageEntity
		])
	],
	providers: [ChatGateway, FriendshipService]
})
export class ChatModule {}
