import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserChatroomEntity } from './user-chatroom.entity';

enum ChatroomStatus {
  Public = 'public',
  Private = 'private',
}

@Entity()
export class ChatroomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ChatroomStatus,
    default: ChatroomStatus.Public,
  })
  status: ChatroomStatus;

  @Column()
  password: string;

  @OneToMany(() => UserChatroomEntity, (userChatroom) => userChatroom.chatroom)
  members: UserChatroomEntity[];
}
