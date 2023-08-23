import { IsNotEmpty } from 'class-validator';

export class BlockUserDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  targetUserId: number;
}
