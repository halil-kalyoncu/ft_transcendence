import { MatchType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsEnum(MatchType)
  matchType: MatchType;
}
