import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  Channel,
  ChannelMember,
  ChannelVisibility,
  Prisma,
  User,
  ChannelMemberRole,
  ChannelMemberStatus,
} from '@prisma/client';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import * as bcrypt from 'bcryptjs';
import {
  SetPasswordDto,
  DeletePasswordDto,
  CreateChannelDto,
  ChannelMembershipDto,
  AdminActionDto,
  ChannelInfoDto,
} from '../../dto/channel.dto';
import { ChannelMemberService } from '../channel-member/channel-member.service';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ConnectedUserService))
    private connectedUserService: ConnectedUserService,
    private channelMemberService: ChannelMemberService,
  ) {}

  async createProtectedChannel({
    userId,
    name,
    password,
    channelVisibility,
  }: {
    userId: number;
    name: string;
    password?: string;
    channelVisibility: ChannelVisibility;
  }): Promise<Channel> {
    const existingChannel = await this.prisma.channel.findFirst({
      where: { name: name },
    });

    if (existingChannel) {
      throw new Error('Channel name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the channel without the members initially
    const channel = await this.prisma.channel.create({
      data: {
        name: name,
        protected: true,
        passwordHash: hashedPassword,
        visibility: channelVisibility,
      },
    });

    // Add the user creating the channel as a member (owner)
    await this.prisma.channelMember.create({
      data: {
        userId: userId,
        channelId: channel.id,
        role: ChannelMemberRole.OWNER,
      },
    });

    return channel;
  }

  async createUnProtectedChannel({
    userId,
    name,
    channelVisibility,
  }: {
    userId: number;
    name: string;
    channelVisibility: ChannelVisibility;
  }): Promise<Channel> {
    const existingChannel = await this.prisma.channel.findFirst({
      where: { name: name },
    });

    if (existingChannel) {
      throw new Error('Channel name already exists');
    }

    const channel = await this.prisma.channel.create({
      data: {
        name: name,
        visibility: channelVisibility,
      },
    });

    // Add the user creating the channel as a member (owner)
    await this.prisma.channelMember.create({
      data: {
        userId: userId,
        channelId: channel.id,
        role: ChannelMemberRole.OWNER,
      },
    });

    return channel;
  }

  async setPassword(setPasswordDto: SetPasswordDto): Promise<Channel> {
    const channel = await this.find(setPasswordDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);

    if (!channel || channelOwner.userId !== setPasswordDto.userId) {
      throw new Error('Only the owner of the channel can set the password.');
    }

    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);

    return this.prisma.channel.update({
      where: { id: setPasswordDto.channelId },
      data: {
        passwordHash: hashedPassword,
      },
    });
  }

  async deletePassword(deletePasswordDto: DeletePasswordDto): Promise<Channel> {
    const channel = await this.find(deletePasswordDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);

    if (!channel || channelOwner.userId !== deletePasswordDto.userId) {
      throw new Error('Only the owner of the channel can delete the password.');
    }

    return this.prisma.channel.update({
      where: { id: deletePasswordDto.channelId },
      data: {
        passwordHash: null,
      },
    });
  }

  async addUserToChannel(
    channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    const existingMembership = await this.findMember(
      channelMembershipDto.userId,
      channelMembershipDto.channelId,
    );

    if (existingMembership) {
      throw new Error('User is already a member of this channel.');
    }

    return this.prisma.channelMember.create({
      data: {
        userId: channelMembershipDto.userId,
        channelId: channelMembershipDto.channelId,
        role: ChannelMemberRole.MEMBER,
      },
    });
  }

  async removeUserFromChannel(
    channelMembershipDto: ChannelMembershipDto,
  ): Promise<ChannelMember> {
    const member = await this.findMember(
      channelMembershipDto.userId,
      channelMembershipDto.channelId,
    );

    if (!member) {
      throw new Error('User is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: channelMembershipDto.userId,
          channelId: channelMembershipDto.channelId,
        },
      },
    });
  }

  async makeAdmin(adminActionDto: AdminActionDto): Promise<ChannelMember> {
    const channel = await this.find(adminActionDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);

    if (!channel || channelOwner.userId !== adminActionDto.requesterId) {
      throw new Error(
        'Only the owner of the channel can make a user an admin.',
      );
    }

    const targetMembership = await this.findMember(
      adminActionDto.targetUserId,
      adminActionDto.channelId,
    );

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        role: ChannelMemberRole.ADMIN,
      },
    });
  }

  async kickChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.find(adminActionDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);
    const requesterMembership = await this.findMember(
      adminActionDto.requesterId,
      adminActionDto.channelId,
    );

    if (
      !channel ||
      (channelOwner.userId !== adminActionDto.requesterId &&
        requesterMembership?.role !== ChannelMemberRole.ADMIN) ||
      requesterMembership?.role !== ChannelMemberRole.OWNER
    ) {
      throw new Error(
        'Only the owner or an admin can kick a user from the channel.',
      );
    }

    const targetMembership = await this.findMember(
      adminActionDto.targetUserId,
      adminActionDto.channelId,
    );

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
    });
  }

  async banChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.find(adminActionDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);
    const requesterMembership = await this.findMember(
      adminActionDto.requesterId,
      adminActionDto.channelId,
    );

    if (
      !channel ||
      (channelOwner.userId !== adminActionDto.requesterId &&
        requesterMembership?.role === ChannelMemberRole.MEMBER)
    ) {
      throw new Error(
        'Only the owner or an admin can ban a user from the channel.',
      );
    }

    const targetMembership = await this.findMember(
      adminActionDto.targetUserId,
      adminActionDto.channelId,
    );

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        status: ChannelMemberStatus.BANNED,
        statusSince: new Date(),
      },
    });
  }

  async muteChannelMember(
    adminActionDto: AdminActionDto,
  ): Promise<ChannelMember> {
    const channel = await this.find(adminActionDto.channelId);
    const channelOwner = await this.channelMemberService.findOwner(channel.id);
    const requesterMembership = await this.findMember(
      adminActionDto.requesterId,
      adminActionDto.channelId,
    );

    if (
      !channel ||
      (channelOwner.userId !== adminActionDto.requesterId &&
        requesterMembership?.role! === ChannelMemberRole.MEMBER)
    ) {
      throw new Error(
        'Only the owner or an admin can mute a user in the channel.',
      );
    }

    const targetMembership = await this.findMember(
      adminActionDto.targetUserId,
      adminActionDto.channelId,
    );

    if (!targetMembership) {
      throw new Error('Target user is not a member of the channel.');
    }

    const unmuteAt = new Date();
    unmuteAt.setMinutes(unmuteAt.getMinutes() + 5);

    return this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId: adminActionDto.targetUserId,
          channelId: adminActionDto.channelId,
        },
      },
      data: {
        unmuteAt: unmuteAt,
      },
    });
  }

  async find(channelId: number): Promise<Channel> {
    return await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
  }

  async findMember(userId: number, channelId: number) {
    return this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
  }

  async getMembers(channelId: number): Promise<User[]> {
    const members = await this.prisma.channelMember.findMany({
      where: {
        channelId,
      },
      include: {
        user: true,
      },
    });

    return members.map((member) => member.user);
  }

  async getOwner(channelId: number): Promise<User | null> {
	const channelMember = await this.prisma.channelMember.findFirst({
	  where: {
		channelId: channelId,
		role: ChannelMemberRole.OWNER,
	  },
	  include: {
		user: true,
	  },
	});
  
	if (channelMember) {
	  return channelMember.user;
	} else {
	  return null;
	}
  }
  

  async getChannelsforId(
	userId: number,
	role = 'all'
  ): Promise<ChannelInfoDto[]> {
	let memberships;
	switch (role) {
	  case 'all':
		memberships = await this.prisma.channelMember.findMany({
		  where: {
			userId: userId,
		  },
		  include: {
			channel: {
			  include: {
				members: {
				  where: {
					role: ChannelMemberRole.OWNER,
				  },
				  include: {
					user: true,
				  },
				},
			  },
			},
		  },
		});
		break;
  
	  case 'admin':
	  case 'owner':
	  case 'member':
		memberships = await this.prisma.channelMember.findMany({
		  where: {
			userId: userId,
			role: ChannelMemberRole[role.toUpperCase()],
		  },
		  include: {
			channel: {
			  include: {
				members: {
				  where: {
					role: ChannelMemberRole.OWNER,
				  },
				  include: {
					user: true,
				  },
				},
			  },
			},
		  },
		});
		break;
  
	  default:
		throw new Error('Invalid role value');
	}
  
	const MembershipEntries: ChannelInfoDto[] = await Promise.all(
	  memberships.map(async (membership) => {
		const channel = membership.channel;
		const owner = membership.channel.members[0]?.user || null;
		return { channel: channel, owner: owner };
	  })
	);
	return MembershipEntries;
  }

  async getAllPublicChannels(
  ): Promise<ChannelInfoDto[]> {
	const channels = await this.prisma.channel.findMany({
	  where: {
		visibility: ChannelVisibility.PUBLIC,
	  },
	  include: {
		members: {
		  where: {
			role: ChannelMemberRole.OWNER,
					  },
		  include: {
			user: true,
					  },
				},
					  },
					});

	const channelEntries: ChannelInfoDto[] = await Promise.all(
	 channels.map(async (channel) => {
		const owner = channel.members[0]?.user || null;
		return { channel: channel, owner: owner };
	 }));
	 return channelEntries;
}
}

