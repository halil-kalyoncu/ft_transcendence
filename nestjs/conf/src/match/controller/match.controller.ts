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
import { MatchService } from '../service/match.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { Match, Prisma } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaModel } from '../../_gen/prisma-class/index';

@ApiTags('Match module')
@Controller('matches')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create match' })
  @ApiResponse({
    status: 201,
    description: 'Successful creation of match',
    type: PrismaModel.Match,
  })
  @ApiResponse({ status: 400, description: 'CreateMatchDto has errors' })
  @ApiResponse({
    status: 500,
    description: "UserId can't be assigned to a user",
  })
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

  @ApiOperation({ summary: 'Get the match object by supplying the match id' })
  @ApiResponse({
    status: 201,
    description: 'Successful retrieval of match, null if id is not found',
    type: PrismaModel.Match,
  })
  @Get('find-by-id')
  async findById(@Query('id', ParseIntPipe) id: number): Promise<Match | null> {
    return await this.matchService.findById(id);
  }

  //not used
  // @Delete('delete-by-id')
  // async deleteById(@Query('id', ParseIntPipe) id: number): Promise<Match> {
  //     return await this.matchService.deleteById(id);
  // }

  @ApiOperation({
    summary:
      'Get the match objectes with the state INVITED and matching rightUserIds',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful retrieval of matches',
    type: PrismaModel.Match,
  })
  @Get('invites-by-userId')
  async getInvitesByUserId(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<Match[]> {
    return await this.matchService.getInvites(userId);
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
