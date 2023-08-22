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

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule, forwardRef(() => UserModule)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '10000s' },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    JwtAuthService,
    TwoFactorAuthService,
    UserService,
  ],
  exports: [JwtAuthService],
  controllers: [TwoFactorAuthController],
})
export class AuthModule {}
