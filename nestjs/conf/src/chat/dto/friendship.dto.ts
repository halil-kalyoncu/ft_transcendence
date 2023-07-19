import { User } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FriendshipDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  friend: User;

  @IsOptional()
  isOnline: boolean;
}
