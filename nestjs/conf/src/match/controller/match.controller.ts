import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MatchService } from '../service/match.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { Match, Prisma } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { matchOutcomesDto } from '../dto/match-outcomes.dto';

@ApiTags('Match module')
@Controller('matches')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create match' })
  @ApiResponse({
    status: 201,
    description: 'Successful creation of match',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 400, description: 'CreateMatchDto has errors' })
  @ApiResponse({
    status: 500,
    description: 'Server error',
  })
  @ApiBearerAuth('access-token')
  @Post('create')
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    try {
      const matchEntity: Prisma.MatchCreateInput =
        this.createMatchDtoToEntity(createMatchDto);
      return await this.matchService.create(matchEntity);
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the match object by supplying the match id' })
  @ApiResponse({
    status: 201,
    description: 'Successful retrieval of match, null if id is not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('find-by-id')
  async findById(@Query('id', ParseIntPipe) id: number): Promise<Match | null> {
    try {
      return await this.matchService.findById(id);
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('find-matches-by-user')
  async findMatchByUser(
    @Query('userid', ParseIntPipe) userid: number,
  ): Promise<Match[] | null> {
    return await this.matchService.findMatchByUser(userid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('match-outcomes')
  async getMatchOutcomes(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<matchOutcomesDto> {
    const matchOutcomes: matchOutcomesDto =
      await this.matchService.getMatchOutcomesByUserId(userId);
    return matchOutcomes;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Get the match objectes with the state INVITED and matching rightUserIds',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful retrieval of matches',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('invites-by-userId')
  async getInvitesByUserId(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<Match[]> {
    try {
      return await this.matchService.getInvites(userId);
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private createMatchDtoToEntity(
    createMatchDto: CreateMatchDto,
  ): Prisma.MatchCreateInput {
    return {
      leftUser: { connect: { id: createMatchDto.userId } },
      type: createMatchDto.matchType,
    };
  }
}
