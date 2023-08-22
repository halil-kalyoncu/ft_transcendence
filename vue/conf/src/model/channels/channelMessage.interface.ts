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
  

  <style>
.current-channel-name {
  text-align: center;
  font-size: 1.25rem;
  margin: -1rem 0 0 0;
  font-family: 'Courier New', Courier, monospace !important;
  color: #ea9f42;
}

.channel-manager-info {
  display: flex; /* Change display to flex */
  justify-content: space-between; /* Distribute items evenly */
  align-items: center; /* Center items vertically */
  margin: 0.25rem 0 0 0;
  min-height: 2.75rem;
}

.channel-manager-info .join-channel-button,
.channel-manager-info .password-input {
  flex: 1; /* Distribute available space evenly among buttons and input */
  background-color: #f64456;
  border: none;
  transition: background-color 0.25s ease-out;
}

.channel-manager-info .join-channel-button:hover {
  border: none;
}

.channel-manager-info .leave-channel-button {
  background-color: #f64456;
  margin-left: 0.5rem; /* Add spacing between buttons */
}

.channel-manager-info .password-input {
  margin: 0;
}

.change-password-container {
  width: 100%;
  margin: -1.25px 0 0 0;
  padding: 0;
  box-sizing: border-box;
}