import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

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

  it.skip('Not writing tests is a bad practice', () => {
  });
});