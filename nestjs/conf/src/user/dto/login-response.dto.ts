import { IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  access_token: string;

  @IsNotEmpty()
  token_type: string;

  @IsNotEmpty()
  expires_in: number;
}
