import { Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { UserChatroomEntity } from "../chatroom/user-chatroom.entity";

@Entity()
export class GroupMessageEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => MessageEntity)
	message: MessageEntity;

	@ManyToOne(() => UserChatroomEntity)
	sender: UserChatroomEntity;

}
