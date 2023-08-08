import { IsNotEmpty } from 'class-validator';

export class GetDirectMessagesDto {
  @IsNotEmpty()
  userId1: number;

  @IsNotEmpty()
  userId2: number;
}
