import type { UserI } from './user.interface'

export interface FriendshipEntryI {
  id: number
  friend: UserI
  isOnline?: boolean
}
