import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { ChannelVisibility } from '@prisma/client';
import {
  SetPasswordDto,
  DeletePasswordDto,
  CreateChannelDto,
  ChannelMembershipDto,
  AdminActionDto,
} from '../../dto/channel.dto';

import * as bcrypt from 'bcryptjs';

describe('FriendshipService', () => {
  let service: ChannelService;
  let prismaService: PrismaService;
  let connectedUserService: ConnectedUserService;

  it.skip('Not writing tests is a bad practice', () => {
  });

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       ChannelService,
  //       { provide: PrismaService, useValue: PrismaService.getInstance() },
  //       ConnectedUserService,
  //     ],
  //   }).compile();

  //   service = module.get<ChannelService>(ChannelService);
  //   prismaService = module.get<PrismaService>(PrismaService);
  //   connectedUserService =
  //     module.get<ConnectedUserService>(ConnectedUserService);
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // it('should create a channel and assign the creator as the owner', async () => {
  //   const result = {
  //     id: 1,
  //     name: 'Mock Channel',
  //     ownerId: 11,
  //     password: 'hashedmagic',
  //     visibility: ChannelVisibility.PUBLIC,
  //   };

  //   const findFirstSpy = jest
  //     .spyOn(prismaService.channel, 'findFirst')
  //     .mockResolvedValue(null);

  //   const createChannelSpy = jest
  //     .spyOn(prismaService.channel, 'create')
  //     .mockResolvedValue(result);

  //   const createMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'create')
  //     .mockResolvedValue(undefined);

  //   const userId = 11;
  //   const name = 'Mock Channel';
  //   const password = 'hashedmagic';
  //   const channelVisibility = ChannelVisibility.PUBLIC;

  //   expect(
  //     await service.createChannel({
  //       userId,
  //       name,
  //       password,
  //       channelVisibility,
  //     }),
  //   ).toEqual(result);

  //   expect(findFirstSpy).toBeCalledWith({
  //     where: { name: name },
  //   });

  //   expect(createChannelSpy).toBeCalledWith({
  //     data: {
  //       name,
  //       password,
  //       ownerId: userId,
  //       visibility: channelVisibility,
  //     },
  //   });

  //   expect(createMemberSpy).toBeCalledWith({
  //     data: {
  //       userId,
  //       channelId: result.id,
  //       role: UserRole.OWNER,
  //     },
  //   });

  //   findFirstSpy.mockRestore();
  //   createChannelSpy.mockRestore();
  //   createMemberSpy.mockRestore();
  // });

  // it('should set password for channel owner', async () => {
  //   const channelId = 1;
  //   const userId = 1;
  //   const password = 'password';
  //   const hashedPassword = 'hashedPassword';

  //   jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

  //   const channel = { id: channelId, name: 'test', ownerId: userId };
  //   jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue(channel as any);

  //   const updatedChannel = { ...channel, password: hashedPassword };
  //   jest
  //     .spyOn(prismaService.channel, 'update')
  //     .mockResolvedValue(updatedChannel as any);

  //   expect(await service.setPassword({ channelId, userId, password })).toEqual(
  //     updatedChannel,
  //   );
  //   expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
  //   expect(prismaService.channel.update).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     data: { password: hashedPassword },
  //   });
  // });

  // it('should throw error when non-owner tries to set password', async () => {
  //   const channelId = 1;
  //   const userId = 1;
  //   const password = 'password';

  //   const channel = { id: channelId, name: 'test', ownerId: userId + 1 };
  //   jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue(channel as any);

  //   await expect(
  //     service.setPassword({ channelId, userId, password }),
  //   ).rejects.toThrow('Only the owner of the channel can set the password.');
  //   expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  // });

  // it('should delete password for channel owner', async () => {
  //   const channelId = 1;
  //   const userId = 1;

  //   const channel = {
  //     id: channelId,
  //     name: 'test',
  //     ownerId: userId,
  //     password: 'password',
  //   };
  //   jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue(channel as any);

  //   const updatedChannel = { ...channel, password: null };
  //   jest
  //     .spyOn(prismaService.channel, 'update')
  //     .mockResolvedValue(updatedChannel as any);

  //   expect(
  //     await service.deletePassword({ channelId: channelId, userId: userId }),
  //   ).toEqual(updatedChannel);
  //   expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(prismaService.channel.update).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     data: { password: null },
  //   });
  // });

  // it('should throw error when non-owner tries to delete password', async () => {
  //   const channelId = 1;
  //   const userId = 1;

  //   const channel = {
  //     id: channelId,
  //     name: 'test',
  //     ownerId: userId + 1,
  //     password: 'password',
  //   };
  //   jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue(channel as any);

  //   await expect(
  //     service.deletePassword({ channelId: channelId, userId: userId }),
  //   ).rejects.toThrow('Only the owner of the channel can delete the password.');
  //   expect(prismaService.channel.findUnique).toHaveBeenCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  // });

  // it('should let a user join a channel', async () => {
  //   const userId = 11;
  //   const channelId = 1;

  //   const findUniqueSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue(null);

  //   const createSpy = jest
  //     .spyOn(prismaService.channelMember, 'create')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: userId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.joinChannel({
  //     channelId: channelId,
  //     userId: userId,
  //   });

  //   expect(channelMember.userId).toBe(userId);
  //   expect(channelMember.channelId).toBe(channelId);
  //   expect(channelMember.role).toBe(UserRole.MEMBER);
  //   expect(findUniqueSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: userId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(createSpy).toBeCalledWith({
  //     data: {
  //       userId: userId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //     },
  //   });

  //   findUniqueSpy.mockRestore();
  //   createSpy.mockRestore();
  // });

  // it('should not let a user join a channel if they are already a member', async () => {
  //   const userId = 11;
  //   const channelId = 1;

  //   const existingMembership = {
  //     id: 1,
  //     userId: userId,
  //     channelId: channelId,
  //     role: UserRole.MEMBER,
  //     banned: false,
  //     unmuteAt: new Date(),
  //   };

  //   const findUniqueSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue(existingMembership);

  //   await expect(
  //     service.joinChannel({ userId: userId, channelId: channelId }),
  //   ).rejects.toThrow('You are already a member of this channel.');
  //   expect(findUniqueSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: userId,
  //         channelId: channelId,
  //       },
  //     },
  //   });

  //   findUniqueSpy.mockRestore();
  // });

  // it('should let a user leave a channel', async () => {
  //   const userId = 11;
  //   const channelId = 1;

  //   const findUniqueSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: userId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const deleteSpy = jest
  //     .spyOn(prismaService.channelMember, 'delete')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: userId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.leaveChannel({
  //     userId: userId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.userId).toBe(userId);
  //   expect(channelMember.channelId).toBe(channelId);
  //   expect(findUniqueSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: userId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(deleteSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: userId,
  //         channelId: channelId,
  //       },
  //     },
  //   });

  //   findUniqueSpy.mockRestore();
  //   deleteSpy.mockRestore();
  // });

  // it('should not let a user leave a channel if they are not a member', async () => {
  //   const userId = 11;
  //   const channelId = 1;

  //   const findUniqueSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue(null);

  //   await expect(
  //     service.leaveChannel({ userId: userId, channelId: channelId }),
  //   ).rejects.toThrow('User is not a member of the channel.');
  //   expect(findUniqueSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: userId,
  //         channelId: channelId,
  //       },
  //     },
  //   });

  //   findUniqueSpy.mockRestore();
  // });

  // it('should let an owner make a user an admin', async () => {
  //   const ownerId = 11;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const updateSpy = jest
  //     .spyOn(prismaService.channelMember, 'update')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.ADMIN,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.makeAdmin({
  //     requesterId: ownerId,
  //     targetUserId: targetUserId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.role).toBe(UserRole.ADMIN);
  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(updateSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //     data: {
  //       role: UserRole.ADMIN,
  //     },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  //   updateSpy.mockRestore();
  // });

  // it('should not let a admin make a user an admin', async () => {
  //   const ownerId = 11;
  //   const nonOwnerId = 22;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   await expect(
  //     service.makeAdmin({
  //       requesterId: nonOwnerId,
  //       targetUserId: targetUserId,
  //       channelId: channelId,
  //     }),
  //   ).rejects.toThrow(
  //     'Only the owner of the channel can make a user an admin.',
  //   );

  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  // });

  // it('should let an owner or admin ban a user from the channel', async () => {
  //   const ownerId = 11;
  //   const adminId = 22;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       password: 'hashedmagic',
  //       ownerId: ownerId,
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockImplementation((async (args: any) => {
  //       if (args.where.userId_channelId.userId === adminId) {
  //         return {
  //           id: 1,
  //           userId: adminId,
  //           channelId: channelId,
  //           role: UserRole.ADMIN,
  //           banned: false,
  //           unmuteAt: null,
  //         };
  //       }
  //       if (args.where.userId_channelId.userId === targetUserId) {
  //         return {
  //           id: 1,
  //           userId: targetUserId,
  //           channelId: channelId,
  //           role: UserRole.MEMBER,
  //           banned: false,
  //           unmuteAt: null,
  //         };
  //       }
  //     }) as any);

  //   const updateSpy = jest
  //     .spyOn(prismaService.channelMember, 'update')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: true,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.banChannelMember({
  //     requesterId: adminId,
  //     targetUserId: targetUserId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.banned).toBe(true);
  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenCalledTimes(2);
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(1, {
  //     where: {
  //       userId_channelId: {
  //         userId: adminId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(2, {
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(updateSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //     data: {
  //       banned: true,
  //     },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  //   updateSpy.mockRestore();
  // });

  // it('should let an owner ban a user from the channel', async () => {
  //   const ownerId = 11;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       password: 'hashedmagic',
  //       ownerId: ownerId,
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockImplementation((async (args: any) => {
  //       if (args.where.userId_channelId.userId === ownerId) {
  //         return {
  //           id: 1,
  //           userId: ownerId,
  //           channelId: channelId,
  //           role: UserRole.OWNER,
  //           banned: false,
  //           unmuteAt: null,
  //         };
  //       }
  //       if (args.where.userId_channelId.userId === targetUserId) {
  //         return {
  //           id: 1,
  //           userId: targetUserId,
  //           channelId: channelId,
  //           role: UserRole.MEMBER,
  //           banned: false,
  //           unmuteAt: null,
  //         };
  //       }
  //     }) as any);

  //   const updateSpy = jest
  //     .spyOn(prismaService.channelMember, 'update')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: true,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.banChannelMember({
  //     requesterId: ownerId,
  //     targetUserId: targetUserId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.banned).toBe(true);
  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenCalledTimes(2);
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(1, {
  //     where: {
  //       userId_channelId: {
  //         userId: ownerId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(2, {
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(updateSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //     data: {
  //       banned: true,
  //     },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  //   updateSpy.mockRestore();
  // });

  // it('should not let a member ban a user from the channel', async () => {
  //   const ownerId = 11;
  //   const nonOwnerId = 22;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue({
  //       id: 1,
  //       userId: nonOwnerId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   await expect(
  //     service.banChannelMember({
  //       requesterId: nonOwnerId,
  //       targetUserId: targetUserId,
  //       channelId: channelId,
  //     }),
  //   ).rejects.toThrow(
  //     'Only the owner or an admin can ban a user from the channel.',
  //   );

  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: nonOwnerId,
  //         channelId: channelId,
  //       },
  //     },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  // });

  // it('should let an admin mute a user in the channel', async () => {
  //   const ownerId = 11;
  //   const adminId = 22;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockImplementation((async (args: any) => {
  //       if (args.where.userId_channelId.userId === adminId) {
  //         return {
  //           id: 1,
  //           userId: adminId,
  //           channelId: channelId,
  //           role: UserRole.ADMIN,
  //           banned: false,
  //           unmuteAt: new Date(),
  //         };
  //       }
  //       return {
  //         id: 2,
  //         userId: targetUserId,
  //         channelId: channelId,
  //         role: UserRole.MEMBER,
  //         banned: false,
  //         unmuteAt: new Date(),
  //       };
  //     }) as any);

  //   const updateSpy = jest
  //     .spyOn(prismaService.channelMember, 'update')
  //     .mockResolvedValue({
  //       id: channelId,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.muteChannelMember({
  //     requesterId: adminId,
  //     targetUserId: targetUserId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.unmuteAt).toBeDefined();
  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenCalledTimes(2);
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(1, {
  //     where: {
  //       userId_channelId: {
  //         userId: adminId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(2, {
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(updateSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //     data: expect.objectContaining({ unmuteAt: expect.any(Date) }),
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  //   updateSpy.mockRestore();
  // });

  // it('should let an owner mute a user in the channel', async () => {
  //   const ownerId = 11;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockImplementation((async (args: any) => {
  //       if (args.where.userId_channelId.userId === ownerId) {
  //         return {
  //           id: 1,
  //           userId: ownerId,
  //           channelId: channelId,
  //           role: UserRole.ADMIN,
  //           banned: false,
  //           unmuteAt: new Date(),
  //         };
  //       }
  //       return {
  //         id: 2,
  //         userId: targetUserId,
  //         channelId: channelId,
  //         role: UserRole.MEMBER,
  //         banned: false,
  //         unmuteAt: new Date(),
  //       };
  //     }) as any);

  //   const updateSpy = jest
  //     .spyOn(prismaService.channelMember, 'update')
  //     .mockResolvedValue({
  //       id: channelId,
  //       userId: targetUserId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   const channelMember = await service.muteChannelMember({
  //     requesterId: ownerId,
  //     targetUserId: targetUserId,
  //     channelId: channelId,
  //   });

  //   expect(channelMember.unmuteAt).toBeDefined();
  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenCalledTimes(2);
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(1, {
  //     where: {
  //       userId_channelId: {
  //         userId: ownerId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(findUniqueMemberSpy).toHaveBeenNthCalledWith(2, {
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //   });
  //   expect(updateSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: targetUserId,
  //         channelId: channelId,
  //       },
  //     },
  //     data: expect.objectContaining({ unmuteAt: expect.any(Date) }),
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  //   updateSpy.mockRestore();
  // });

  // it('should not let a non-owner or non-admin mute a user in the channel', async () => {
  //   const ownerId = 11;
  //   const nonOwnerId = 22;
  //   const targetUserId = 33;
  //   const channelId = 1;

  //   const findUniqueChannelSpy = jest
  //     .spyOn(prismaService.channel, 'findUnique')
  //     .mockResolvedValue({
  //       id: channelId,
  //       name: 'Test Channel',
  //       ownerId: ownerId,
  //       password: 'hashedmagic',
  //       visibility: ChannelVisibility.PUBLIC,
  //     });

  //   const findUniqueMemberSpy = jest
  //     .spyOn(prismaService.channelMember, 'findUnique')
  //     .mockResolvedValue({
  //       id: 2,
  //       userId: nonOwnerId,
  //       channelId: channelId,
  //       role: UserRole.MEMBER,
  //       banned: false,
  //       unmuteAt: new Date(),
  //     });

  //   await expect(
  //     service.muteChannelMember({
  //       requesterId: nonOwnerId,
  //       targetUserId: targetUserId,
  //       channelId: channelId,
  //     }),
  //   ).rejects.toThrow(
  //     'Only the owner or an admin can mute a user in the channel.',
  //   );

  //   expect(findUniqueChannelSpy).toBeCalledWith({
  //     where: { id: channelId },
  //     include: { owner: true },
  //   });
  //   expect(findUniqueMemberSpy).toBeCalledWith({
  //     where: {
  //       userId_channelId: {
  //         userId: nonOwnerId,
  //         channelId: channelId,
  //       },
  //     },
  //   });

  //   findUniqueChannelSpy.mockRestore();
  //   findUniqueMemberSpy.mockRestore();
  // });
});
