import type { UserI } from '../user.interface'

export interface AchievementI {
  id?: number
  name: string
  progress: number
  scoreBronze: number
  scoreSilver: number
  scoreGold: number
}
