import {
  Body,
  Controller,
  Get,
  Delete,
  ParseIntPipe,
  Post,
  Query,
  Patch,
  UseGuards,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel, ChannelMember, ChannelMessage } from '@prisma/client';
import { ChannelService } from '../../service/channel/channel.service';
import {
  CreateChannelDto,
  ChannelMembershipDto,
  AdminActionDto,
  ChannelInfoDto,
  ChannelMemberDto,
} from '../../dto/channel.dto';
import { ChannelMemberService } from '../../service/channel-member/channel-member.service';
import { ErrorDto } from 'src/chat/dto/error.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

@ApiTags('Channel module')
@Controller('channel')
export class ChannelController {
  constructor(
    private prisma: PrismaService,
    private ChannelService: ChannelService,
    private ChannelMemberService: ChannelMemberService,
  ) {}
  //Get Functions for getting Channels
  @Get('getAllChannels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getAllChannels(): Promise<Channel[]> {
    try {
      return await this.prisma.channel.findMany();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAllChannelsFromUser')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getAllChannelsFromUser(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('role') role: string,
  ): Promise<ChannelInfoDto[]> {
    try {
      return await this.ChannelService.getChannelsforId(userId, role);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAllChannelsWhereUserAdmin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getAllChannelsWhereUserAdmin(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInfoDto[]> {
    try {
      return await this.ChannelService.getChannelsforId(userId, 'admin');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAllPublicChannels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getAllPublicChannels(): Promise<ChannelInfoDto[]> {
    try {
      return await this.ChannelService.getAllPublicChannels();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAllAvaiableChannels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getAllAvaiableChannels(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<ChannelInfoDto[]> {
    try {
      return await this.ChannelService.getAllAvailableChannels(userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('getAllChannelManagerMembers')
  async getAllUsersChannelMembers(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMemberDto[]> {
    try {
      return await this.ChannelService.getAllChannelManagerMembers(channelId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('isUserBanned')
  async isUserBanned(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<boolean> {
    try {
      return await this.ChannelMemberService.isUserBanned(userId, channelId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('comparePassword')
  async comparePassword(
    @Query('channelId', ParseIntPipe) channelId: number,
    @Query('password') password: string,
  ): Promise<boolean> {
    try {
      return await this.ChannelService.comparePassword(channelId, password);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Post Functions to create Channels
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('createProtectedChannel')
  async createChannel(
    @Body() CreateChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    try {
      return await this.ChannelService.createProtectedChannel(CreateChannelDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('createUnProtectedChannel')
  async createUnProtectedChannel(
    @Body() CreateChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    try {
      return await this.ChannelService.createUnProtectedChannel(
        CreateChannelDto,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Patch Functions to change existing Channel properties

  @Patch('addUserToChannel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async addUserToChannel(
    @Body() ChannelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    try {
      return await this.ChannelService.addUserToChannel(ChannelMembershipDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('MakeUserAdmin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async MakeUserAdmin(@Body() AdminActionDto: AdminActionDto): Promise<void> {
    try {
      await this.ChannelService.makeAdmin(AdminActionDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('KickUser')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async KickUser(@Body() AdminActionDto: AdminActionDto): Promise<void> {
    try {
      await this.ChannelService.kickChannelMember(AdminActionDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('updateMutedUsers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async updateMutedUsers(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelMember[]> {
    try {
      return await this.ChannelService.updateMutedUsers(channelId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('removeUserFromChannel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async removeUserFromChannel(
    @Body() ChannelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    try {
      return await this.ChannelService.removeUserFromChannel(
        ChannelMembershipDto,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('destroyChannel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async destroyChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<Channel> {
    try {
      return await this.ChannelService.destroyChannel(channelId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
