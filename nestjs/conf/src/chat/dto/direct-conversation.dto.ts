import { IsNotEmpty } from 'class-validator';

export class DirectConverstationDto {
  @IsNotEmpty()
  readerUserId: number;

  @IsNotEmpty()
  withUserId: number;
}
