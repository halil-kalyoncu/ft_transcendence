import { ApiProperty } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class matchOutcomesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  wins: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  losses: number;
}
