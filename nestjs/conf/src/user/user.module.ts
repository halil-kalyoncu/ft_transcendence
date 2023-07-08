import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user.entity';
import { UserService } from './service/user-service/user.service';
import { UserController } from './controller/user.controller';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  providers: [UserService, UserHelperService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
