import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ChannelInvitationStatus } from '@prisma/client';
//import { DateTime } from 'luxon'; 

export class ChannelInvitationDto {
@IsNotEmpty()
invitationId: number  
	
@IsNotEmpty()
  inviterName: string
  
  @IsNotEmpty()
  channelName: string

  @IsOptional()
  isPasswordProtected: boolean

}

export class AnswerChannelInvitationDto {
	@IsNotEmpty()
	invitationId: number

	@IsNotEmpty()
	inviteeId : number

}

export class ChannelInviteeUserDto {
	@IsNotEmpty()
	id: number

	@IsNotEmpty()
	username: string

	@IsOptional()
	status: ChannelInvitationStatus
}