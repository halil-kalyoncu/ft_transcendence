import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';
import { BlockUserDto } from '../../dto/block-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blocked Users (Chat module)')
@Controller('blockedUsers')
export class BlockedUserController {
  constructor(private blockedUserService: BlockedUserService) {}

  @Post()
  async blockUser(@Body() blockUserDto: BlockUserDto): Promise<any> {
    try {
      return await this.blockedUserService.block(
        blockUserDto.userId,
        blockUserDto.targetUserId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getBlockedUsers(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<any[]> {
    try {
      return await this.blockedUserService.getBlockedUsers(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete()
  async unblockUser(@Body() blockUserDto: BlockUserDto): Promise<any> {
    try {
      return await this.blockedUserService.unblock(
        blockUserDto.userId,
        blockUserDto.targetUserId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
