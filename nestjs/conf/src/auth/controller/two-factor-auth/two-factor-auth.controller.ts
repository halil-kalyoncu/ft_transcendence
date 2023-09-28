import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Get,
  Query,
  Res,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TwoFactorAuthService } from '../../service/two-factor-auth/two-factor-auth.service';
import { Response } from 'express';
import { TwoFactorAuthCodeDto } from '../../dto/two-factor-auth-code.dto';
import { UserService } from '../../../user/service/user-service/user.service';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { HttpException, HttpStatus } from '@nestjs/common';

@ApiTags('Two Factor Authentification (Auth module)')
@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userService: UserService,
  ) {}

  @Get('twoFAstatus')
  async twoFAstatus(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<boolean> {
    try {
      return await this.userService.twoFAstatus(userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('checkFAcode')
  async checkFAcode(
    @Query('intraLogin') intraLogin: string,
    @Query('code') code: string,
  ): Promise<string> {
    try {
      const jwt: string = await this.twoFactorAuthService.checkFAcode(
        intraLogin,
        code,
      );
      return btoa(jwt);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
    try {
      return await this.twoFactorAuthService.enable(
        twoFactorAuthCodeDto.userId,
        twoFactorAuthCodeDto.code,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('disable')
  async disable(@Query('userId', ParseIntPipe) userId: number): Promise<User> {
    try {
      return this.userService.turnOffTwoFactorAuth(userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
