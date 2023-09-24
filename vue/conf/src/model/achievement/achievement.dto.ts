import type { AchievementTypeType } from './achievement.interface'

export interface CreateAchievementDto {
  userId: number
  achievementType: AchievementTypeType
}