import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DirectConverstationDto {
  @ApiProperty()
  @IsNotEmpty()
  readerUserId: number;

  @ApiProperty()
  @IsNotEmpty()
  withUserId: number;
}
