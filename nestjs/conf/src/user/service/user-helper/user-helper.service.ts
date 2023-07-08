import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../../user/model/dto/create-user.dto';
import { UserI } from '../../../user/model/user.interface';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): UserI {
    return {
      username: createUserDto.username,
    };
  }
}
