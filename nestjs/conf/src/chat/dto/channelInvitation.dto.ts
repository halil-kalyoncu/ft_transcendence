import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ChannelInvitationStatus } from '@prisma/client';
import { ChannelVisibility } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ChannelInvitationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  invitationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  inviterName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  inviterUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  channelName: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPasswordProtected: boolean;

  @ApiProperty()
  @IsOptional()
  ChannelVisibility: ChannelVisibility;
}

export class AnswerChannelInvitationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  invitationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  inviteeId: number;
}

export class ChannelInviteeUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsOptional()
  status: ChannelInvitationStatus;
}

export class GotChannelInvitationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  inviteeUsername: string;
}

export class SignInChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;
}
