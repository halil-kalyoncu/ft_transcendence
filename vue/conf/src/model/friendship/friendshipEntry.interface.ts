import type { UserI } from '../user.interface'

export const FriendshipEntryStatus = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  REJECTED: 'REJECTED' as const
}

export type FriendshipEntryStatusType = (typeof FriendshipEntryStatus)[keyof typeof FriendshipEntryStatus]

export interface FriendshipEntryI {
  id: number
  friend: UserI
  status?: FriendshipEntryStatusType
}
