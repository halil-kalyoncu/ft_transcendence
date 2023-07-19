import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectMessageDto {
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
