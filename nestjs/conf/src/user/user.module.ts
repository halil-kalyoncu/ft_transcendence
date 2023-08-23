import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user-service/user.service';
import { UserController } from './controller/user.controller';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { ConnectedUserService } from '../chat/service/connected-user/connected-user.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => ChatModule)],
  providers: [UserService, UserHelperService, ConnectedUserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
