import type { MatchTypeType } from './match.interface'

export interface CreateMatchDto {
  userId: number
  matchType: MatchTypeType
}
