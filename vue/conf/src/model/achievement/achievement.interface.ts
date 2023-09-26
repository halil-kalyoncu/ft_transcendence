import type { UserI } from '../user.interface'

export const AchievementType = {
  BRONZE: 'BRONZE' as const,
  SILVER: 'SILVER' as const,
  GOLD: 'GOLD' as const,
}

export type AchievementTypeType = (typeof AchievementType)[keyof typeof AchievementType]

export interface AchievementI {
  id?: number
  type?: AchievementTypeType
}
