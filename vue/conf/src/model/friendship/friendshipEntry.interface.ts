import type { UserI } from '../user.interface'

export const FriendshipEntryStatus = {
  ONLINE: 'ONLINE' as const,
  OFFLINE: 'OFFLINE' as const,
  INGAME: 'INGAME' as const
}

export type FriendshipEntryStatusType =
  (typeof FriendshipEntryStatus)[keyof typeof FriendshipEntryStatus]

export interface FriendshipEntryI {
  id: number
  friend: UserI
  status?: FriendshipEntryStatusType
  blocked?: boolean
}
