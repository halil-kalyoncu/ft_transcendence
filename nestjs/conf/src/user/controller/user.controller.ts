import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { Prisma, User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Response } from 'express';
import { PrismaModel } from '../../_gen/prisma-class/index';
import { ChannelInviteeUserDto } from '../../chat/dto/channelInvitation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RegisterUserDto } from '../dto/register-user.dto';

@ApiTags('User module')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  @Get('canBeRegistered')
  async canBeRegistered(
    @Query('intraLogin') intraLogin: string,
  ): Promise<boolean> {
    try {
      const user: User = await this.userService.findByIntraLogin(intraLogin);

      if (!user || user.username) {
        return false;
      }
      return true;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<string> {
    try {
      const userEntity: Prisma.UserCreateInput =
        this.userHelperService.dtoToEntity(registerUserDto);
      const jwt: string = await this.userService.register(userEntity);
      return btoa(jwt);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('registerWithAvatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.AVATARPATH,
        filename: (req, file, callback) => {
          const id = uuidv4();
          const ext = extname(file.originalname);
          const filename = `${id}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async registerWithAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg)',
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10, //10mb
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<string> {
    try {
      const jwt: string = await this.userService.registerWithAvatar(
        file,
        registerUserDto,
      );
      return btoa(jwt);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users',
    type: PrismaModel.User,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user by id',
    type: PrismaModel.User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('find-by-id')
  async findById(@Query('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.userService.findById(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find user by username' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user by username',
    type: PrismaModel.User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('find')
  async find(@Query('username') username: string): Promise<User> {
    try {
      return await this.userService.findByUsername(username);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find users that have a similar username' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users that have a similar username',
    type: PrismaModel.User,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('find-by-username')
  async findAllByUsername(
    @Query('username') username: string,
  ): Promise<User[]> {
    try {
      return await this.userService.findAllByUsername(username);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Get users that are not in a channel, for channel invite suggestions',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users that are not in a channel',
    type: PrismaModel.User,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('findUsersNotInChannel')
  async findUsersNotInChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelInviteeUserDto[]> {
    try {
      return this.userService.findUsersNotInChannel(channelId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Successful upload of user avatar' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.AVATARPATH,
        filename: (req, file, callback) => {
          const id = uuidv4();
          const ext = extname(file.originalname);
          const filename = `${id}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg)',
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10, //10mb
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    try {
      return await this.userService.uploadAvatar(file, userId);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Serve user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user avatar',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or does not have an avatar',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth('access-token')
  @Get('avatar/:userId')
  async serverAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    try {
      const user: User = await this.userService.findById(userId);

      if (!user) {
        return res.status(404).send('User not found.');
      }
      if (!user.avatarId) {
        return res.status(404).send('User does not have an avatar.');
      }

      const avatarStream = fs.createReadStream(
        process.env.AVATARPATH + '/' + user.avatarId,
      );
      avatarStream.pipe(res);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Successful deletion of user avatar',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({
    status: 404,
    description:
      "User couldn't be indentified with the userId, User doesn't have an avatar",
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiBearerAuth('access-token')
  @Patch('avatar/:userId')
  async deleteAvatar(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const user: User = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.avatarId) {
        throw new NotFoundException('User has no avatar');
      }
      return await this.userService.deleteAvatar(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find users sorted by Ladderscore' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users sorted by Ladderscore',
    type: PrismaModel.User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, access token is invalid',
  })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBearerAuth('access-token')
  @Get('get-all-users-by-ladder')
  async getAllUsersByLadder(): Promise<User[]> {
    try {
      return await this.userService.getAllUsersByLadder();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
