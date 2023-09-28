import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  intraLogin: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
