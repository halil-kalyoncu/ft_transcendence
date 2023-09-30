import { ApiProperty } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class WinsLosesDto {
  @ApiProperty()
  @IsNotEmpty()
  wins: number;

  @ApiProperty()
  @IsNotEmpty()
  loses: number;
}
