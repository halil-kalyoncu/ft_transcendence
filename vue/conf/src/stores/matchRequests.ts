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
    addMatchRequest(newMatchRequest: MatchI) {
      this.matchRequests.push(newMatchRequest)
    }
  }
})
