import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FriendshipDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  friend: User;

  @ApiProperty()
  @IsOptional()
  isOnline: boolean;
}
