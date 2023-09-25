import type { UserI } from '../user.interface'

export const AchievementType = {
  BRONZE: 'BRONZE' as const,
  SILVER: 'SILVER' as const,
  GOLD: 'GOLD' as const,
  PLATINUM: 'PLATINUM' as const
}

export type AchievementTypeType = (typeof AchievementType)[keyof typeof AchievementType]

export const AchievementStatus = {
  EARNED: 'EARNED' as const,
  PENDING: 'PENDING' as const
}

export type AchievementStatusType = (typeof AchievementStatus)[keyof typeof AchievementStatus]

export interface AchievementI {
  id?: number
  userId?: number
  type?: AchievementTypeType
  status?: AchievementStatusType
  earnedAt?: Date
  user?: UserI
}
