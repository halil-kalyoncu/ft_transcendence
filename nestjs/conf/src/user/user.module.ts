import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user-service/user.service';
import { UserController } from './controller/user.controller';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UserService, UserHelperService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
