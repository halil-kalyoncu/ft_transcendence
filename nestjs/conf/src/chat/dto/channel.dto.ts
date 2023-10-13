import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { ChannelVisibility, Channel, User, Message } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ChannelVisibility)
  channelVisibility: ChannelVisibility;
}

export class SetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class DeletePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

export class ChannelMembershipDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}

export class AdminActionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  requesterId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  targetUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  minutesToMute?: number;
}

export class ChannelInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  channel: Channel;

  @ApiProperty()
  @IsNotEmpty()
  owner: User;
}

export class ChannelMessageDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: Message;

  @ApiProperty()
  @IsNotEmpty()
  sender: User;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsBoolean()
  blockGroupMessage: boolean;
}

export class ChannelMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelMemberId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  channelName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  roleSince: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  statusSince: Date;

  @ApiProperty()
  @IsBoolean()
  banned: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  unmuteAt: Date;
}
