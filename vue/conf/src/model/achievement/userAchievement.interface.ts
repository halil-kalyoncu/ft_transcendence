import type { UserI } from '../user.interface'
import type { AchievementI } from './achievement.interface'

export const UserAchievementState = {
  BRONZE: 'BRONZE' as const,
  SILVER: 'SILVER' as const,
  GOLD: 'GOLD' as const
}

export type UserAchievementStateType =
  (typeof UserAchievementState)[keyof typeof UserAchievementState]

export interface UserAchievementI {
  id?: number
  userId?: number
  achievementId: number
  progress: number
  state: UserAchievementStateType

  achievement: AchievementI
}
