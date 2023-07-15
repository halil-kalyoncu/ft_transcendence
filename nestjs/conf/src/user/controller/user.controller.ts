import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { LoginResponseI } from '../model/login-response.interface';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  //remove this function, when 42 login works
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto): Promise<LoginResponseI> {
    const userEntity: UserI =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    const jwt: string = await this.userService.login(userEntity);
    return {
      access_token: jwt,
      token_type: 'JWT',
      expires_in: 10000,
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
    const UserEntity: UserI =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.create(UserEntity);
  }

  @Get()
  async findAll(): Promise<UserI[]> {
    return this.userService.findAll();
  }

  @Get('find-by-username')
  async findAllByUsername(
    @Query('username') username: string,
  ): Promise<UserI[]> {
    return this.userService.findAllByUsername(username);
  }
}
