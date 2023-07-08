import { UserEntity } from '../../../user/model/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatroomEntity } from './chatroom.entity';

export enum UserStatus {
  Normal = 'normal',
  Banned = 'banned',
  Muted = 'muted',
}

export enum UserRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

@Entity()
export class UserChatroomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Normal })
  status: UserStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  statusSince: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Member })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  roleSince: Date;

  @ManyToOne(() => UserEntity, (user) => user.joinedChatrooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ChatroomEntity, (chatroom) => chatroom.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatroomId' })
  chatroom: ChatroomEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}
