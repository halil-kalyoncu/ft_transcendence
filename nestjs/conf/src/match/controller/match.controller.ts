import { Body, Controller, Delete, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MatchService } from '../service/match.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { Match, Prisma } from '@prisma/client';

@Controller('matches')
export class MatchController {
    constructor(private matchService: MatchService) {}

    @Post('create')
    async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
        const matchEntity: Prisma.MatchCreateInput = this.createMatchDtoToEntity(createMatchDto);
        return await this.matchService.create(matchEntity);
    }

    @Get('find-by-id')
    async findById(@Query('id', ParseIntPipe) id: number) {
        return await this.matchService.findById(id);
    }

    //not used
    // @Delete('delete-by-id')
    // async deleteById(@Query('id', ParseIntPipe) id: number): Promise<Match> {
    //     return await this.matchService.deleteById(id);
    // }

    @Get('invites-by-userId')
    async getInvitesByUserId(@Query('userId', ParseIntPipe) userId: number): Promise<Match[]> {
        return await this.matchService.getInvites(userId);
    }

    private createMatchDtoToEntity(createMatchDto: CreateMatchDto): Prisma.MatchCreateInput {
        return {
            leftUser: { connect: { id: createMatchDto.userId } },
            type: createMatchDto.matchType
        }
    }
}
