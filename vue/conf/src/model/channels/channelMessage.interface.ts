import type { MessageI } from '../message.interface'
import type { UserI } from '../user.interface';
import type { ChannelMemberI } from './createChannel.interface'

export interface ChannelMessageI{
	id?: number
	message: MessageI;
	sender: UserI;
	createdAt: Date;
	//channelMessageReadStatus: ChannelMessageReadStatusI[];
  }

export interface ChannelMessageReadStatusI{
	id: number;
	messageId: number;
	readerId: number;
	isRead: boolean;
	reader: UserI;
  }
  

