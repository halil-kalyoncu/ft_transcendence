import { Injectable } from '@nestjs/common';
import { UserService } from '../../../user/service/user-service/user.service';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { Response } from 'express';
import { toFileStream } from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly userService: UserService) {}

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

  async checkCodeValid(userId: number, code: string): Promise<boolean> {
    const user: User = await this.userService.findById(userId);
    return authenticator.verify({
      token: code,
      secret: user.secret2FA,
    });
  }
}
