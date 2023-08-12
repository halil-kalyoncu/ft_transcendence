import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessageService } from './direct-message.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MessageService } from '../message/message.service';

describe('DirectMessageService', () => {
  let service: DirectMessageService;

  it.skip('Not writing tests is a bad practice', () => {
  });

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       DirectMessageService,
  //       { provide: PrismaService, useValue: PrismaService.getInstance() },
  //       MessageService,
  //     ],
  //   }).compile();

  //   service = module.get<DirectMessageService>(DirectMessageService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
