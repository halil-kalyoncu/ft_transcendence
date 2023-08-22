import { Injectable } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { CreateChannelMessageDto } from '../../dto/create-channel-message.dto';
import {ChannelMessageDto} from '../../dto/channel.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage, Message, User, Channel, ChannelMember  } from '@prisma/client';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class ChannelMessageService {
  constructor(
    private prisma: PrismaService,
    private channelService: ChannelService,
    private messageService: MessageService,
  ) {}

  async create(
	createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<ChannelMessage> {
	const { senderId, channelId, message } = createChannelMessageDto;
  
	const channel = await this.channelService.find(channelId);
  
	if (!channel) {
	  throw new Error("Channel doesn't exist");
	}
  
	const member = await this.channelService.findMember(senderId, channelId);
  
	if (!member) {
	  throw new Error('Member is not part of the channel');
	}
  
	const createdMessage = await this.messageService.createOne({ message });
	const createdChannelMessage = await this.prisma.channelMessage.create({
	  data: {
		sender: { connect: { id: member.id } },
		message: { connect: { id: createdMessage.id } },
	  },
	  include: {
		sender: true,
		message: true,
	  },
	});
  
	// Add a log to indicate that the ChannelMessage was created
	console.log('ChannelMessage created:', createdChannelMessage);
  
	// Return the created ChannelMessage
	return createdChannelMessage;
  }
  
  async createChannelMessageI(
	createChannelMessageDto: CreateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
	const { senderId, channelId, message } = createChannelMessageDto;
  
	const channel = await this.channelService.find(channelId);
  
	if (!channel) {
	  throw new Error("Channel doesn't exist");
	}
  
	const member = await this.channelService.findMember(senderId, channelId);
  
	if (!member) {
	  throw new Error('Member is not part of the channel');
	}
  
	const createdMessage = await this.messageService.createOne({ message });
	const createdChannelMessage = await this.prisma.channelMessage.create({
	  data: {
		sender: { connect: { id: member.id } },
		message: { connect: { id: createdMessage.id } },
	  },
	  include: {
		sender: {
			include: {
				user: true,
			}
		},
		message: true,
	  },
	});
  
	  // Create a ChannelMessageDto using the returned data
	  const channelMessageDto: any = {
		id: createdChannelMessage.id,
		message: createdChannelMessage.message,
		sender: createdChannelMessage.sender.user,
		createdAt: createdChannelMessage.message.createdAt,
	  };
	// Return the created ChannelMessage
	return channelMessageDto;
  }
  
async getChannelMessagesforChannel(channelId: number): Promise<ChannelMessageDto[]>
{
	try {
		const channelMessages: any[] = await this.prisma.channelMessage.findMany({
		  where: {
			sender: {
			  channel: {
				id: channelId, 
			  }
			}
		  },
		  include: {
			message: true,
			sender: {
			  include: {
				user: true,
			  }
			}
		  },
		  orderBy: {
			message: {
			  createdAt: 'desc', 
			},
		  },
		});
	  
		const channelMessageDtos: ChannelMessageDto[] = channelMessages.map(channelMessage => ({
		  id: channelMessage.id,
		  message: channelMessage.message,
		  sender: channelMessage.sender.user,
		  createdAt: channelMessage.message.createdAt,
		}));
		return channelMessageDtos.reverse();
	  } catch (error) {
		console.error("Error fetching channel messages:", error);
		throw error;
	  }
}

  //how to fetch this stuff so that I have the right dto object 
//   async getChannelMessagesforChannel(channelId: number): Promise<ChannelMessageDto[]> {
// 	try {
// 	  // Fetch the channel along with its related channel messages
// 	  const channelWithMessages: Channel | null = await this.prisma.channel.findUnique({
// 		where: {
// 		  id: channelId,
// 		},
// 		include: {
// 		  members: {
// 			include: {
// 		  channelMessage: {
// 			include: {
// 			  message: true,
// 			  sender: true,
// 			},
// 		  },
// 			},
// 		},
// 	}
// 	  });
  
// 	  if (!channelWithMessages) {
// 		throw new Error("Channel not found");
// 	  }
  
// 	  // Extract and transform the channel messages into the desired DTO format
// 	  const channelMessageDtos: ChannelMessageDto[] = channelWithMessages.channelMessage.map(
// 		(channelMessage) => {
// 		  return {
// 			id: channelMessage.id,
// 			message: channelMessage.message as Message, // Type assertion to Message type
// 			sender: channelMessage.sender as ChannelMember, // Type assertion to ChannelMember type
// 			createdAt: channelMessage.message.createdAt,
// 		  };
// 		}
// 	  );
  
// 	  return channelMessageDtos;
// 	} catch (error) {
// 	  console.error("Error fetching channel messages:", error);
// 	  return []; // Return an empty array or handle the error as appropriate for your application
// 	}
//   }
}