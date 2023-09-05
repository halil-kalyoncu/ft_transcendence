import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Matchmaking } from '@prisma/client';
import { PrismaModel } from '../../_gen/prisma-class/index';
import { MatchmakingService } from '../service/matchmaking.service';

@ApiTags('Matchmaking module')
@Controller('matchmaking')
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @ApiResponse({
    status: 200,
    description:
      "Successful retrieval of matchmaking entry of user, null when user has no matchmaking entry or user doesn't exists",
    type: PrismaModel.Matchmaking,
  })
  @Get('/:userId')
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Matchmaking | null> {
    return await this.matchmakingService.getByUserId(userId);
  }

  @ApiResponse({
    status: 200,
    description:
      "Successfull deletion of matchmaking entry by user id, null when user has no matchmaking entry or user doesn't exists",
    type: PrismaModel.Matchmaking,
  })
  @Delete('/:userId')
  async deleteByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Matchmaking | null> {
    return await this.matchmakingService.deleteByUserId(userId);
  }
}
