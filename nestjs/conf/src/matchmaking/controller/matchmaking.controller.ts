import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Matchmaking } from '@prisma/client';
import { MatchmakingService } from '../service/matchmaking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@ApiTags('Matchmaking module')
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get matchmaking object from a user' })
  @ApiResponse({
    status: 200,
    description:
      "Successful retrieval of matchmaking entry of user, null when user has no matchmaking entry or user doesn't exists",
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Matchmaking | null> {
    return await this.matchmakingService.getByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete matchmaking object from a user' })
  @ApiResponse({
    status: 200,
    description:
      "Successfull deletion of matchmaking entry by user id, null when user has no matchmaking entry or user doesn't exists",
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Delete('/:userId')
  async deleteByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Matchmaking | null> {
    return await this.matchmakingService.deleteByUserId(userId);
  }
}
