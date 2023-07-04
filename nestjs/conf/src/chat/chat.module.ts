import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipEntity } from './model/friendship/friendship.entity';
import { FriendshipService } from './service/friendship/friendship.service';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		UserModule,
		TypeOrmModule.forFeature([
			FriendshipEntity
		])
	],
	providers: [ChatGateway, FriendshipService]
})
export class ChatModule {}
