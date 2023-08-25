import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'The generated access token' })
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({ description: 'The type of the token' })
  @IsNotEmpty()
  token_type: string;

  @ApiProperty({ description: 'The expiration time of the token' })
  @IsNotEmpty()
  expires_in: number;
}
