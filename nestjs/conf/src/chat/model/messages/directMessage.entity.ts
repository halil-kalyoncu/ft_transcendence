import { Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../../../user/model/user.entity';

@Entity()
export class DirectMessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => MessageEntity)
  message: MessageEntity;

  @ManyToOne(() => UserEntity)
  sender: UserEntity;

  @ManyToOne(() => UserEntity)
  receiver: UserEntity;
}
