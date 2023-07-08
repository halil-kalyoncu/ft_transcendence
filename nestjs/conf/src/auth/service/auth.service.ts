import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	generateJwt(user: UserI): Promise<string> {
		return this.jwtService.signAsync({ user });
	}

	verifyJwt(jwt: string): Promise<any> {
		return this.jwtService.verifyAsync(jwt);
	}

}
