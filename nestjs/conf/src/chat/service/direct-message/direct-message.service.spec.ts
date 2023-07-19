import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessageService } from './direct-message.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MessageService } from '../message/message.service';

describe('DirectMessageService', () => {
  let service: DirectMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectMessageService, PrismaService, MessageService],
    }).compile();

    service = module.get<DirectMessageService>(DirectMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});