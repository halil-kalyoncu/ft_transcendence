import { IsNotEmpty } from 'class-validator';

export class SendGameInviteDto {
  @IsNotEmpty()
  matchId: number;

  @IsNotEmpty()
  invitedUserId: number;
}
