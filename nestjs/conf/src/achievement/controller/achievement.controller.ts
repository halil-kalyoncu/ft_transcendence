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
import { Achievement } from '@prisma/client';

@ApiTags('Achievement module')
@Controller('achievement')
export class AchievementController {
  constructor(
    private prisma: PrismaService,
    private AchievementService: AchievementService,
  ) {}

  @Get('get-user-achievements')
  async getUserAchievements(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<UserAchievements[] | null> {
    try {
      return await this.AchievementService.getUserAchievements(userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get-achievements')
  async getAchievements(): Promise<Achievement[] | null> {
    try {
      return await this.AchievementService.getAchievements();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
