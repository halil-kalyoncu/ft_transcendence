import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthCodeDto {
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  code: string;
}
