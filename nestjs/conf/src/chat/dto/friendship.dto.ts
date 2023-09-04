import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum FriendshipEntryStatus {
  Online = 'ONLINE',
  Offline = 'OFFLINE',
  Ingame = 'INGAME',
}

export class FriendshipDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  friend: User;

  @ApiProperty()
  @IsOptional()
  @IsEnum(FriendshipEntryStatus)
  status: FriendshipEntryStatus;
}
