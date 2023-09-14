import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendGameInviteDto {
  @ApiProperty()
  @IsNotEmpty()
  matchId: number;

  @ApiProperty()
  @IsNotEmpty()
  invitedUsername: string;

  @ApiProperty()
  @IsNotEmpty()
  goalsToWin: number;

  @ApiProperty()
  powerupNames: string[];
}
