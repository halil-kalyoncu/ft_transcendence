import { Test, TestingModule } from '@nestjs/testing';
import { ConnectedUserService } from './connected-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConnectedUserEntity } from '../../../chat/model/connected-user/connected-user.entity';

describe('ConnectedUserService', () => {
  let service: ConnectedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectedUserService,
                {
        provide: getRepositoryToken(ConnectedUserEntity),
        useValue: {},
      },],
    }).compile();

    service = module.get<ConnectedUserService>(ConnectedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
