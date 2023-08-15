import { IsNotEmpty, IsString } from 'class-validator';

export class ErrorDto {
  @IsNotEmpty()
  @IsString()
  error: string;
}
