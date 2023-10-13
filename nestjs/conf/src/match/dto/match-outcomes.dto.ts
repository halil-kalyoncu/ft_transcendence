import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class matchOutcomesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  wins: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  losses: number;
}
