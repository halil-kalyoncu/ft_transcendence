import type { UserI } from '../user.interface'

export const MatchType = {
  LADDER: 'LADDER' as const,
  CUSTOM: 'CUSTOM' as const
}

export type MatchTypeType = (typeof MatchType)[keyof typeof MatchType]

export const MatchState = {
  CREATED: 'CREATED' as const,
  INVITED: 'INVITED' as const,
  ACCEPTED: 'ACCEPTED' as const,
  STARTED: 'STARTED' as const,
  DISCONNECTLEFT: 'DISCONNECTLEFT' as const,
  DISCONNECTRIGHT: 'DISCONNECTRIGHT' as const,
  WINNERLEFT: 'WINNERLEFT' as const,
  WINNERRIGHT: 'WINNERRIGHT' as const
}

export type MatchStateType = (typeof MatchState)[keyof typeof MatchState]

export interface MatchI {
  id?: number
  leftUserId?: number
  rightUserId?: number
  type?: MatchTypeType
  state?: MatchStateType
  goalsLeftPlayer?: number
  goalsRightPlayer?: number
  goalsToWin?: number
  createdAt?: Date
  statedAt?: Date
  finishedAt?: Date
  leftUser?: UserI
  rightUser?: UserI
}
