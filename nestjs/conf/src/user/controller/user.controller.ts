import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { LoginResponseDto } from '../dto/login-response.dto';
import { Prisma, User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Response } from 'express';
import { PrismaModel } from '../../_gen/prisma-class/index';
import { ChannelInviteeUserDto } from '../../chat/dto/channelInvitation.dto';

@ApiTags('User module')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  //remove this function, when 42 login works
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 201,
    description: 'Successful login',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'CreateUserDto has errors' })
  @ApiResponse({ status: 409, description: 'User is already logged in' })
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    try {
      const userEntity: Prisma.UserCreateInput =
        this.userHelperService.createUserDtoToEntity(createUserDto);
      const jwt: string = await this.userService.login(userEntity);
      return {
        access_token: jwt,
        token_type: 'JWT',
        expires_in: 10000,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  //use this route, when 42 login works
  // @Post()
  // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   try {
  //     const UserEntity: Prisma.UserCreateInput =
  //       this.userHelperService.createUserDtoToEntity(createUserDto);
  //     return await this.userService.create(UserEntity);
  //   } catch(error) {
  //     if (error.message === 'Username is already in use') {
  //       throw new HttpException('Username is already in use', HttpStatus.CONFLICT);
  //     }
  //     throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users',
    type: PrismaModel.User,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @ApiOperation({ summary: 'Find user by username' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user by username',
    type: PrismaModel.User,
  })
  @Get('find')
  async find(@Query('username') username: string): Promise<User> {
    return await this.userService.findByUsername(username);
  }

  @ApiOperation({ summary: 'Find users by username' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of users that contain the username',
    type: PrismaModel.User,
    isArray: true,
  })
  @Get('find-by-username')
  async findAllByUsername(
    @Query('username') username: string,
  ): Promise<User[]> {
    return await this.userService.findAllByUsername(username);
  }

  @Get('findUsersNotInChannel')
  async findUsersNotInChannel(
    @Query('channelId', ParseIntPipe) channelId: number,
  ): Promise<ChannelInviteeUserDto[]> {
    return this.userService.findUsersNotInChannel(channelId);
  }

  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Successful upload of user avatar' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
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
    @Res() res: Response,
  ): Promise<void> {
    try {
      const updatedUser = await this.userService.uploadAvatar(file, userId);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  @ApiOperation({ summary: 'Serve user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of user avatar',
  })
  @ApiResponse({ status: 404, description: 'User does not have an avatar' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('avatar/:userId')
  async serverAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    try {
      const user: User = await this.userService.findById(userId);

      if (!user.avatarId) {
        return res.status(404).send('User does not have an avatar.');
      }

      const avatarStream = fs.createReadStream(user.avatarId);
      avatarStream.pipe(res);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  //TODO: return
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Successful deletion of user avatar',
  })
  @Patch('avatar/:userId')
  async deleteAvatar(@Param('userId', ParseIntPipe) userId: number) {
    const user: User = await this.userService.findById(userId);
    if (!user) {
      return { error: 'Failed to find user' };
    }
    if (!user.avatarId) {
      return { error: 'User has no uploaded avatar' };
    }
    return await this.userService.deleteAvatar(userId);
  }
}
