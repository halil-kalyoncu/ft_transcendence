import type { UserI } from '../user.interface'

export const FriendshipStatus = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  REJECTED: 'REJECTED' as const
}

export type FriendshipStatusType = (typeof FriendshipStatus)[keyof typeof FriendshipStatus]

export interface FriendshipI {
  id: number
  senderId: number
  receiverId: number
  status: FriendshipStatusType
  requestedAt: Date
  sender?: UserI
  receiver?: UserI
}
