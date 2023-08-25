import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UnreadMessagesDto {
  @ApiProperty()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty()
  @IsNotEmpty()
  amountUnread: number;
}
