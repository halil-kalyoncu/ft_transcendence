import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
