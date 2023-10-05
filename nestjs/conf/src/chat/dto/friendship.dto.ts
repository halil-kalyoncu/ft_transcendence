import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export enum FriendshipEntryStatus {
  Online = 'ONLINE',
  Offline = 'OFFLINE',
  Ingame = 'INGAME',
}

export class FriendshipDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  friend: User;

  @ApiProperty()
  @IsOptional()
  @IsEnum(FriendshipEntryStatus)
  status: FriendshipEntryStatus;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  blocked: boolean;
}
