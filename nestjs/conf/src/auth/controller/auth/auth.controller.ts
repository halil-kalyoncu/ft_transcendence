import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';

@Controller('auth')
export class AuthController {

	constructor() {}

	@Get('callback')
	async fortyTwoCallback(@Query('code') code:string) {
		console.log(code);

		try {
			const response = await axios.post('https://api.intra.42.fr/oauth/token', null, {
				params: {
					grant_type: 'authorization_code',
					client_id: process.env.API42_CLIENTID,
					client_secret: process.env.API42_SECRET,
					code: code,
					redirect_uri: "http://10.12.5.1:3000/api/auth/callback"
				}
			});

			console.log(response.data);
			const accessToken = response.data.access_token;

			const responseAuth = await axios.get('https://api.intra.42.fr/v2/me', {
				headers: {
					'Authorization': `Bearer ${accessToken}`
				}
			});

			console.log(responseAuth.data.login);
		}
		catch (error) {
			console.log(error);
		}
	}

}
