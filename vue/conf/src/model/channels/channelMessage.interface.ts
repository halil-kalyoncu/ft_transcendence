import type { MessageI } from '../message.interface'
import type { ChannelMemberI } from './createChannel.interface'

export interface ChannelMessageI{
	id: number;
	messageId: number;
	senderId: number;
	message: MessageI;
	sender: ChannelMemberI;
	channelMessageReadStatus: ChannelMessageReadStatusI[];
  }

export interface ChannelMessageReadStatusI{
	id: number;
	messageId: number;
	readerId: number;
	isRead: boolean;
	reader: ChannelMemberI;
  }
  