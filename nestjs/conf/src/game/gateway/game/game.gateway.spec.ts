import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './game.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [EventsGateway],
  //   }).compile();

  //   gateway = module.get<EventsGateway>(EventsGateway);
  // });

  // it('should be defined', () => {
  //   expect(gateway).toBeDefined();
  // });

  it.skip('Not writing tests is a bad practice', () => {});
});
