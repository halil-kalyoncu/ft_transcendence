import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Message, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChannelMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: Message;

  @ApiProperty()
  @IsNotEmpty()
  sender: User;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}

export class DestroyChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  senderId: number;
}
