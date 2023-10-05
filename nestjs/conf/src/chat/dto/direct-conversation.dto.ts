import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DirectConverstationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readerUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  withUserId: number;
}
