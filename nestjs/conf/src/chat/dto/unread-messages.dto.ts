import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UnreadMessagesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amountUnread: number;
}
