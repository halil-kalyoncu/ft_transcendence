import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendGameInviteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  matchId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  invitedUsername: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  goalsToWin: number;

  @ApiProperty()
  @IsArray()
  powerupNames: string[];
}
