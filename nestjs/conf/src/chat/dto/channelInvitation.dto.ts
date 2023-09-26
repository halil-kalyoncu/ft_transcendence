import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ChannelInvitationStatus } from '@prisma/client';
import { ChannelVisibility } from '@prisma/client';

export class ChannelInvitationDto {
  @IsNotEmpty()
  invitationId: number;

  @IsNotEmpty()
  inviterName: string;

  @IsNotEmpty()
  channelName: string;

  @IsOptional()
  isPasswordProtected: boolean;

  @IsOptional()
  ChannelVisibility: ChannelVisibility;

}

export class AnswerChannelInvitationDto {
  @IsNotEmpty()
  invitationId: number;

  @IsNotEmpty()
  inviteeId: number;
}

export class ChannelInviteeUserDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  status: ChannelInvitationStatus;
}
