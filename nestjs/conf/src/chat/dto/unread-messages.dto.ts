import { IsNotEmpty } from 'class-validator';

export class UnreadMessagesDto {
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  amountUnread: number;
}
