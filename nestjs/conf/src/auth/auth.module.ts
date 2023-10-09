import { Module, forwardRef } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtAuthService } from './service/jwt-auth/jtw-auth.service';
import { TwoFactorAuthService } from './service/two-factor-auth/two-factor-auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/service/user-service/user.service';
import { TwoFactorAuthController } from './controller/two-factor-auth/two-factor-auth.controller';
import { ChatModule } from '../chat/chat.module';
import { ConnectedUserService } from '../chat/service/connected-user/connected-user.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
        forwardRef(() => UserModule),
        forwardRef(() => ChatModule),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '2 days' },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    JwtAuthService,
    TwoFactorAuthService,
    UserService,
    ConnectedUserService,
  ],
  exports: [JwtAuthService],
  controllers: [TwoFactorAuthController],
})
export class AuthModule {}
