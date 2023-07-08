import { UserChatroomEntity } from "src/chat/model/chatroom/user-chatroom.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	username: string;

	@OneToMany(() => UserChatroomEntity, (userChatroom) => userChatroom.user)
	joinedChatrooms: UserChatroomEntity[];
}
