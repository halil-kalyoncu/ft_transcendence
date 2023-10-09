import { ApiProperty } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MatchType)
  matchType: MatchType;
}
