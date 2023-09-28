import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RegisterUserDto } from '../../dto/register-user.dto';

@Injectable()
export class UserHelperService {
  dtoToEntity(registerUserDto: RegisterUserDto): Prisma.UserCreateInput {
    return {
      intraLogin: registerUserDto.intraLogin,
      username: registerUserDto.username,
    };
  }
}
