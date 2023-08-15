import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMessageService } from './channel-message.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MessageService } from '../message/message.service';
import { ChannelService } from '../channel/channel.service';
import { ConnectedUserService } from '../connected-user/connected-user.service';

describe('ChannelMessageService', () => {
  let service: ChannelMessageService;

  it.skip('Not writing tests is a bad practice', () => {});

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       ChannelMessageService,
  //       {
  //         provide: PrismaService,
  //         useValue: PrismaService.getInstance(),
  //       },
  //       ChannelService,
  //       MessageService,
  //       ConnectedUserService,
  //     ],
  //   }).compile();

  //   service = module.get<ChannelMessageService>(ChannelMessageService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
