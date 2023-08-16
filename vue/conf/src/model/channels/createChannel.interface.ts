import type { UserI } from "../user.interface"

export const ChannelVisibility = {
  PUBLIC: 'PUBLIC' as const,
  PROTECTED: 'PROTECTED' as const,
  PRIVATE: 'PRIVATE' as const
}

export const ChannelMemberRole = {
	  OWNER: 'OWNER' as const,
	  ADMIN: 'ADMIN' as const,
	  MEMBER: 'MEMBER' as const
}

export const ChannelMemberStatus = {
	  NORMAL: 'NORMAL' as const,
	  MUTED: 'MUTED' as const,
	  BANNED: 'BANNED' as const
}

export type ChannelMemberRoleType = (typeof ChannelMemberRole)[keyof typeof ChannelMemberRole]
export type ChannelMemberStatusType = (typeof ChannelMemberStatus)[keyof typeof ChannelMemberStatus]
export type ChannelVisibilityType = (typeof ChannelVisibility)[keyof typeof ChannelVisibility]

export interface CreateChannelDto {
  userId: number
  name: string
  password?: string
  channelVisibility: ChannelVisibilityType
}

export interface ChannelMemberI {
	id: number
	userId: number
	channelId: number
	role: ChannelMemberRoleType
	status: ChannelMemberStatusType
}

export interface ChannelI {
	id: number
	name: string
	visibility: ChannelVisibilityType
	protected: boolean
	passwordHash?: string

	members: ChannelMemberI[]
}
export interface ChannelEntryI{
	channel: ChannelI
	owner: UserI
}