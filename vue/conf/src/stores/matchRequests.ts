import { request } from 'http'
import type { MatchI } from '../model/match/match.interface'
import { defineStore } from 'pinia'

type MatchRequestsState = {
  matchRequests: MatchI[]
}

export const useMatchRequestsStore = defineStore('matchRequest', {
  state: (): MatchRequestsState => ({
    matchRequests: []
  }),

  actions: {
    setMatchRequests(matchRequests: MatchI[]) {
      this.matchRequests = matchRequests
    }
  }
})
