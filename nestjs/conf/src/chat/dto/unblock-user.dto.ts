import { IsNotEmpty } from 'class-validator';

export class UnblockUserDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  unblockUserId: number;
}
