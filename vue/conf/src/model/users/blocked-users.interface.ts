import type { UserI } from '../user.interface'

export interface BlockEntryI {
  id: number
  blockedAt: string
  targetUser: UserI
  targetUserId: number
  user: UserI
  userId: number
}
