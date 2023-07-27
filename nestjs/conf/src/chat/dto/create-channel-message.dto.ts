import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelMessageDto {
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  channelId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
