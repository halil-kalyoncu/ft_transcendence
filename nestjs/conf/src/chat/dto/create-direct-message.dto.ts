import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty()
  @IsNotEmpty()
  receiverId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
