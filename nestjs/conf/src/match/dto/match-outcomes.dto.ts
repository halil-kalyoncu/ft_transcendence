import { ApiProperty } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class matchOutcomesDto {
  @ApiProperty()
  @IsNotEmpty()
  wins: number;

  @ApiProperty()
  @IsNotEmpty()
  losses: number;
}
