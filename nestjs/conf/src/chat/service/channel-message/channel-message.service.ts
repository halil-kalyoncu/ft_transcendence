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
      throw new Error("Channel doesn't exists");
    }

    const member = await this.channelService.findMember(senderId, channelId);

    if (!member) {
      throw new Error('Member is not part of the channel');
    }

    const createdMessage = await this.messageService.createOne({ message });

    return this.prisma.channelMessage.create({
      data: {
        sender: { connect: { id: member.id } },
        message: { connect: { id: createdMessage.id } },
      },
      include: {
        sender: true,
        message: true,
      },
    });
  }

async getChannelMessagesforChannel(channelId: number): Promise<{}>
{
	try{
		const channelWithMessages: Channel | null = await this.prisma.channel.findUnique({
			where: {
				id:channelId,
			},
			include: {
				members: {
				include: {
					user:true,
					sendMessages: {
						include: {
							message:true,
						}
					},
				},
				},
			}
	})
	if (!channelWithMessages) {
		throw new Error("Channel not found");
		return {}
	}

	const channelMessageDtos: ChannelMessageDto[] = [];
	for (const member of channelWithMessages.members)
	return channelWithMessages;
}
	catch (error) {
		 	  console.error("Error fetching channel messages:", error);
			return {}
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