import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Get,
  Query,
  Res,
  UnauthorizedException,
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
	try{
		return await this.userService.twoFAstatus(userId);
	} catch (error: any)
	{
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST)}
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
	try{
		const codeValid: boolean = await this.twoFactorAuthService.checkCodeValid(
		  twoFactorAuthCodeDto.userId,
		  twoFactorAuthCodeDto.code,
		);
		if (!codeValid) {
		  throw new UnauthorizedException('Wrong authentication code');
		}
		return this.userService.turnOnTwoFactorAuth(twoFactorAuthCodeDto.userId);
	} catch (error: any)
	{
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST)};
	}

  @Post('disable')
  async disable(
	@Query('userId', ParseIntPipe) userId: number,
	  ): Promise<User> {
	try{
		return this.userService.turnOffTwoFactorAuth(userId);
	} catch (error: any)
	{
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST)}
	}

}
