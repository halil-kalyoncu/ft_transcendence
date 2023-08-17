import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(user: Prisma.UserCreateInput): Promise<string> {
    return this.jwtService.signAsync({ user });
  }

  verifyJwt(jwt: string): Promise<any> {
    return this.jwtService.verifyAsync(jwt);
  }
}
