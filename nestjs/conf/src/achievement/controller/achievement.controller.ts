import {
  Controller,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementService } from '../service/achievement.service';
import { UserAchievements } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@ApiTags('Achievement module')
@Controller('achievement')
export class AchievementController {
  constructor(
    private prisma: PrismaService,
    private AchievementService: AchievementService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('get-user-achievements')
  async getUserAchievements(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UserAchievements[]> {
    try {
      return await this.AchievementService.getUserAchievements(userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
