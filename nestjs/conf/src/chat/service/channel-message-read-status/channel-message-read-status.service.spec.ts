import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMessageReadStatusService } from './channel-message-read-status.service';

describe('ChannelMessageReadStatusService', () => {
  let service: ChannelMessageReadStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelMessageReadStatusService],
    }).compile();

    service = module.get<ChannelMessageReadStatusService>(ChannelMessageReadStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
