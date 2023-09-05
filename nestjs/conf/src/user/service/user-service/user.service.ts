import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../../auth/service/auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User, ChannelInvitationStatus } from '@prisma/client';
import { DirectMessageService } from '../../../chat/service/direct-message/direct-message.service';
import { ChannelInviteeUserDto } from '../../../chat/dto/channelInvitation.dto';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private authService: AuthService,
	) { }

	//remove this, if 42 login works
	async login(user: Prisma.UserCreateInput): Promise<string> {
		let foundUser: User | null = await this.findByUsername(user.username);

		if (!foundUser) {
			foundUser = await this.create(user);
		}
		return this.authService.generateJwt(foundUser);
	}

	async create(newUser: Prisma.UserCreateInput): Promise<User> {
		try {
			const user = await this.prisma.user.create({
				data: newUser,
			});
			return this.findById(user.id);
		} catch {
			throw new HttpException(
				'Username is already in use',
				HttpStatus.CONFLICT,
			);
		}
	}

	async findById(id: number): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id },
		});
	}

	async findByUsername(username: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { username },
		});
	}

	async findAll(): Promise<User[]> {
		return this.prisma.user.findMany();
	}

	async findAllByUsername(username: string): Promise<User[]> {
		return this.prisma.user.findMany({
			where: {
				username: {
					contains: username,
				},
			},
		});
	}
	async findUsersNotInChannel(channelId: number): Promise<ChannelInviteeUserDto[]> {
		const channelInvitees : ChannelInviteeUserDto[] = [];
		const usersNotInChannel = await this.prisma.user.findMany({
			where: {
				NOT: {
					ChannelMember: {
						some: {
							channelId: channelId,
						},
					},
				},
			},
			include: {
				inviteeforChannels: true,
			},
		});

		console.log(usersNotInChannel);
		for (const user of usersNotInChannel) {
			const status = await this.prisma.channelInvitation.findMany({
				where: {
					inviteeId: user.id,
				},
				select: {
					status: true,
			}});
		
			const channelinvitee = {
				id: user.id,
				username: user.username,
				status: status[0]?.status as ChannelInvitationStatus || null,
			};
			channelInvitees.push(channelinvitee);
		}
		return channelInvitees;
}
}
