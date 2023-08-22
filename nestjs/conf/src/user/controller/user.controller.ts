import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { LoginResponseDto } from '../dto/login-response.dto';
import { Prisma, User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Response } from 'express';

@ApiTags('User module')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  //remove this function, when 42 login works
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    const userEntity: Prisma.UserCreateInput =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    const jwt: string = await this.userService.login(userEntity);
    return {
      access_token: jwt,
      token_type: 'JWT',
      expires_in: 10000,
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const UserEntity: Prisma.UserCreateInput =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.create(UserEntity);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('find')
  async find(@Query('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @Get('find-by-username')
  async findAllByUsername(
    @Query('username') username: string,
  ): Promise<User[]> {
    return this.userService.findAllByUsername(username);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './files',
      filename: (req, file, callback) => {
        const id = uuidv4();
        const ext = extname(file.originalname);
        const filename = `${id}${ext}`;
        callback(null, filename);
      }
    })
  }))
  async uploadAvatar(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({
          fileType: '.(png|jpeg|jpg)'
        }),
        new MaxFileSizeValidator({
          maxSize: 1024 * 1024 * 10 //10mb
        })
      ]
    })
  ) file: Express.Multer.File,
  @Query('userId', ParseIntPipe) userId: number,
  @Res() res: Response
  ): Promise<void> {
    try {
      const updatedUser = await this.userService.uploadAvatar(file, userId);
      res.json(updatedUser);
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  }

  @Get('avatar/:userId')
  async serverAvatar(@Param('userId', ParseIntPipe) userId: number, @Res() res: Response) {
    try {
      const user: User = await this.userService.findById(userId);

      if (!user.avatarId) {
        return res.status(404).send('User does not have an avatar.');
      }

      const avatarStream = fs.createReadStream(user.avatarId);
      avatarStream.pipe(res);
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  }

  @Patch('avatar/:userId')
  async deleteAvatar(@Param('userId', ParseIntPipe) userId: number) {
    const user: User = await this.userService.findById(userId);
    if (!user) {
      return { error: 'Failed to find user' }
    }
    if (!user.avatarId) {
      return { error: "User has no uploaded avatar" };
    }
    return this.userService.deleteAvatar(userId);
  }

}
