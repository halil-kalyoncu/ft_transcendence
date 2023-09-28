import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import axios from 'axios';
import { UserService } from '../../../user/service/user-service/user.service';
import { JwtAuthService } from '../../service/jwt-auth/jtw-auth.service';
import { User } from '@prisma/client';
import { ConnectedUserService } from '../../../chat/service/connected-user/connected-user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private jwtAuthService: JwtAuthService,
    private connectedUserService: ConnectedUserService,
  ) {}

  @Get('callback')
  async fortyTwoCallback(@Query('code') code: string, @Res() res) {
	const ipAddress = process.env.IP_ADDRESS;
	const frontendPort = process.env.FRONTEND_PORT;

    try {
      const response = await axios.post(
        'https://api.intra.42.fr/oauth/token',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            client_id: process.env.API42_CLIENTID,
            client_secret: process.env.API42_SECRET,
            code: code,
            redirect_uri: process.env.API42_REDIRECTURI,
          },
        },
      );

      const accessToken = response.data.access_token;

      const responseAuth = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const intraLogin = responseAuth.data.login;

      let user: User = await this.userService.findByIntraLogin(intraLogin);
      if (!user || !user.username) {
        if (!user) {
          user = await this.userService.create({ intraLogin });
        }
        return res.redirect(
          `http://${ipAddress}:${frontendPort}/register/${user.intraLogin}`,
        );
      }

      const connectedUser = await this.connectedUserService.findByUserId(
        user.id,
      );
      if (connectedUser) {
        return res.redirect(`http://${ipAddress}:${frontendPort}?error=already_signedIn`);
      }

      if (user.enabled2FA) {
        return res.redirect(
          `http://${ipAddress}:${frontendPort}/twoFAAuth/${user.intraLogin}`,
        );
      }

      const jwt: string = await this.jwtAuthService.generateJwt(user);
      return res.redirect(`http://${ipAddress}:${frontendPort}/validateToken/${btoa(jwt)}`);
    } catch (error) {
      return res.redirect(`http://${ipAddress}:${frontendPort}?error=authentication_failed`);
    }
  }
}
