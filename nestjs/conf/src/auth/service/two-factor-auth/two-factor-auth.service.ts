import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../../user/service/user-service/user.service';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { JwtAuthService } from '../jwt-auth/jtw-auth.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async generateSecret(userId: number) {
    const user: User = await this.userService.findById(userId);
    const secret: string = authenticator.generateSecret();
    const otpAuthUrl: string = authenticator.keyuri(
      user.username,
      'PONGGAME',
      secret,
    );
    await this.userService.setTwoFactorAuthSecret(user.id, secret);
    return { secret, otpAuthUrl };
  }

  async pipeQRCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  async enable(userId: number, code: string): Promise<User> {
    const user: User = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException("User doesn't exists");
    }

    const codeValid: boolean = this.checkCodeValid(user, code);

    if (!codeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return await this.userService.turnOnTwoFactorAuth(user.id);
  }

  async checkFAcode(intraLogin: string, code: string): Promise<string> {
    const user: User = await this.userService.findByIntraLogin(intraLogin);

    if (!user) {
      throw new NotFoundException(
        `User with the intraLogin ${intraLogin} isn't registered`,
      );
    }
    if (!user.enabled2FA) {
      throw new BadRequestException(`${user.username} hasn't enabled 2FA`);
    }

    const codeValid = this.checkCodeValid(user, code);
    if (!codeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.jwtAuthService.generateJwt(user);
  }

  private checkCodeValid(user: User, code: string): boolean {
    return authenticator.verify({
      token: code,
      secret: user.secret2FA,
    });
  }
}
