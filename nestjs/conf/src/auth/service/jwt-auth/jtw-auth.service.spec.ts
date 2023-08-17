import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthService } from './jtw-auth.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtAuthService', () => {
  let service: JwtAuthService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       AuthService,
  //       {
  //         provide: JwtService,
  //         useValue: {},
  //       },
  //     ],
  //   }).compile();

  //   service = module.get<AuthService>(AuthService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  it.skip('Not writing tests is a bad practice', () => {});
});
