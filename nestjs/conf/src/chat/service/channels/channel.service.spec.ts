import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { Channel, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';


describe('FriendshipService', () => {
  let service: ChannelService;
  let prismaService: PrismaService;
  let connectedUserService: ConnectedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelService, PrismaService, ConnectedUserService],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    prismaService = module.get<PrismaService>(PrismaService);
    connectedUserService =
      module.get<ConnectedUserService>(ConnectedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a channel', async () => {
    const result = {
      id: 1,
      name: "Mock Channel",
      ownerId: 123,
      password: "hashedmagic",
      members: [
      ],
      owner: {
      }
    };
  
    const createSpy = jest
      .spyOn(prismaService.channel, 'create')
      .mockResolvedValue(result);
  
    const mockChannelCreateInput: Prisma.ChannelCreateInput = {
      name: "New Channel",
      password: 'magic',
      owner:  {
        create: undefined,
        connectOrCreate: {
          where: undefined,
          create: undefined,
        },
        connect: undefined,
      },
      members: {
        create: undefined,
        connectOrCreate: {
          where: undefined,
          create: undefined,
        },
        connect: undefined,
      }
    };
  
    expect(await service.create(mockChannelCreateInput)).toBe(result);
    expect(createSpy).toBeCalledWith({ data: mockChannelCreateInput });
  
    createSpy.mockRestore();
  });

  it('should set password for channel owner', async () => {
    const channelId = 1;
    const userId = 1;
    const password = 'password';
    const hashedPassword = 'hashedPassword';
    
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
    
    const channel = { id: channelId, name: 'test', ownerId: userId };
    jest.spyOn(prismaService.channel, 'findUnique').mockResolvedValue(channel as any);

    const updatedChannel = { ...channel, password: hashedPassword };
    jest.spyOn(prismaService.channel, 'update').mockResolvedValue(updatedChannel as any);

    expect(await service.setPassword(channelId, userId, password)).toEqual(updatedChannel);
    expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
      where: { id: channelId },
      include: { owner: true },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(prismaService.channel.update).toHaveBeenCalledWith({
      where: { id: channelId },
      data: { password: hashedPassword },
    });
  });

  it('should throw error when non-owner tries to set password', async () => {
    const channelId = 1;
    const userId = 1;
    const password = 'password';
    
    const channel = { id: channelId, name: 'test', ownerId: userId + 1 };
    jest.spyOn(prismaService.channel, 'findUnique').mockResolvedValue(channel as any);
    
    await expect(service.setPassword(channelId, userId, password)).rejects.toThrow('Only the owner of the channel can set the password.');
    expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
      where: { id: channelId },
      include: { owner: true },
    });
  });

  it('should delete password for channel owner', async () => {
    const channelId = 1;
    const userId = 1;
  
    const channel = { id: channelId, name: 'test', ownerId: userId, password: 'password' };
    jest.spyOn(prismaService.channel, 'findUnique').mockResolvedValue(channel as any);
  
    const updatedChannel = { ...channel, password: null };
    jest.spyOn(prismaService.channel, 'update').mockResolvedValue(updatedChannel as any);
  
    expect(await service.deletePassword(channelId, userId)).toEqual(updatedChannel);
    expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
      where: { id: channelId },
      include: { owner: true },
    });
    expect(prismaService.channel.update).toHaveBeenCalledWith({
      where: { id: channelId },
      data: { password: null },
    });
  });
  
  it('should throw error when non-owner tries to delete password', async () => {
    const channelId = 1;
    const userId = 1;
  
    const channel = { id: channelId, name: 'test', ownerId: userId + 1, password: 'password' };
    jest.spyOn(prismaService.channel, 'findUnique').mockResolvedValue(channel as any);
  
    await expect(service.deletePassword(channelId, userId)).rejects.toThrow('Only the owner of the channel can delete the password.');
    expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
      where: { id: channelId },
      include: { owner: true },
    });
  });

});
