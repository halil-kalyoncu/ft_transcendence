import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('MessageService', () => {
  let service: MessageService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         MessageService,
//         { provide: PrismaService, useValue: PrismaService.getInstance() },
//       ],
//     }).compile();

//     service = module.get<MessageService>(MessageService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
it.skip('Not writing tests is a bad practice', () => {});
});
