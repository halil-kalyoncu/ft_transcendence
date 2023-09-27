import {
  Controller,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementService } from '../service/achievement.service';
import { UserAchievements } from '@prisma/client';

@ApiTags('Achievement module')
@Controller('achievement')
export class AchievementController {
  constructor(
    private prisma: PrismaService,
    private AchievementService: AchievementService,
  ) {}

  @Get('get-achievements')
  async getAchievements(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UserAchievements[] | null> {
    try {
      return await this.AchievementService.getAchievements(userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
