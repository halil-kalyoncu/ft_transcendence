import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): Prisma.UserCreateInput {
    return {
      username: createUserDto.username,
    };
  }
}
