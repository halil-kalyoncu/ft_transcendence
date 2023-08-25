import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendGameInviteDto {
  @ApiProperty()
  @IsNotEmpty()
  matchId: number;

  @ApiProperty()
  @IsNotEmpty()
  invitedUserId: number;
}
