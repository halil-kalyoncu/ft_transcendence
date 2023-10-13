import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlockedUserService } from '../../service/blocked-user/blocked-user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BlockedUser } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

@ApiTags('Blocked Users (Chat module)')
@Controller('blockedUsers')
export class BlockedUserController {
  constructor(private blockedUserService: BlockedUserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a users blocked list' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of blocked list',
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({
    status: 404,
    description: "User couldn't be indentified with the userId",
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get()
  async getBlockedUsers(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<BlockedUser[]> {
    try {
      return await this.blockedUserService.getBlockedUsers(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
