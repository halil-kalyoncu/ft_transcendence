import { ApiProperty } from '@nestjs/swagger';
import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MatchType)
  matchType: MatchType;
}
