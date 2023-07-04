import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../service/user-helper/user-helper.service';

@Controller('users')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService
	) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
		const UserEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto);
		return this.userService.create(UserEntity);
	}

	@Get()
	async findAll(): Promise<UserI[]> {
		return this.userService.findAll();
	}

	@Get('/find-by-username')
	async findAllByUsername(@Query('username') username: string) {
		return this.userService.findAllByUsername(username);
	}

}
