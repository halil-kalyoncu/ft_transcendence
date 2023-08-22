import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { TwoFactorAuthService } from '../../service/two-factor-auth/two-factor-auth.service';
import { Response } from 'express';
import { TwoFactorAuthCodeDto } from '../../dto/two-factor-auth-code.dto';
import { UserService } from '../../../user/service/user-service/user.service';
import { User } from '@prisma/client';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userService: UserService,
  ) {}

  @Post('generate')
  async generate(
    @Query('userId', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    const { otpAuthUrl } = await this.twoFactorAuthService.generateSecret(
      userId,
    );
    return this.twoFactorAuthService.pipeQRCodeStream(res, otpAuthUrl);
  }

  @Post('enable')
  async enable(
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto,
  ): Promise<User> {
    const codeValid: boolean = await this.twoFactorAuthService.checkCodeValid(
      twoFactorAuthCodeDto.userId,
      twoFactorAuthCodeDto.code,
    );
    if (!codeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return this.userService.turnOnTwoFactorAuth(twoFactorAuthCodeDto.userId);
  }
}
