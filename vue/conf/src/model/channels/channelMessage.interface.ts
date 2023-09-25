import type { MessageI } from '../message/message.interface'
import type { UserI } from '../user.interface'
import type { ChannelMemberRoleType, ChannelMemberStatusType } from './createChannel.interface'

export interface ChannelMessageI {
  id?: number
  message: MessageI
  sender: UserI
  createdAt: string
  blockGroupMessage: boolean
  //channelMessageReadStatus: ChannelMessageReadStatusI[];
}

export interface ChannelMessageReadStatusI {
  id: number
  messageId: number
  readerId: number
  isRead: boolean
  reader: UserI
}

export interface ChannelManagerMemberI {
  channelMemberId: number
  channelName: string
  userId: number
  username: string
  role: ChannelMemberRoleType
  roleSince: string
  status: ChannelMemberStatusType
  statusSince: string
  banned: boolean
  unmuteAt: string | null
}
