import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ChannelVisibility } from '@prisma/client';

export class CreateChannelDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsEnum(ChannelVisibility)
  channelVisibility: ChannelVisibility;
}

export class SetPasswordDto {
  @IsNotEmpty()
  channelId: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  password: string;
}

export class DeletePasswordDto {
  @IsNotEmpty()
  channelId: number;

  @IsNotEmpty()
  userId: number;
}

export class ChannelMembershipDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  channelId: number;
}

export class AdminActionDto {
  @IsNotEmpty()
  requesterId: number;

  @IsNotEmpty()
  targetUserId: number;

  @IsNotEmpty()
  channelId: number;
}
