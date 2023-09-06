import { IsNotEmpty, IsString } from 'class-validator';
import { Message, User } from '@prisma/client';

export class CreateChannelMessageDto {
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  channelId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChannelMessageDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  message: Message;

  @IsNotEmpty()
  sender: User;

  @IsNotEmpty()
  createdAt: Date;
  //channelMessageReadStatus: ChannelMessageReadStatusI[];
}

export class DestroyChannelDto {
  @IsNotEmpty()
  channelId: number;

  @IsNotEmpty()
  senderId: number;
}
