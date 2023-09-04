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
    addMatchRequest(newMatchRequest: MatchI[]) {
      const uniqueRequests = newMatchRequest.filter(
        (request) =>
          !this.matchRequests.some((existingRequest) => existingRequest.id === request.id)
      )
      this.matchRequests.push(...uniqueRequests)
    },
    removeMatchRequestById(requestId: number) {
      const index = this.matchRequests.findIndex((request) => request.id === requestId)
      if (index !== -1) {
        this.matchRequests.splice(index, 1)
        console.log(
          `Friend request with ID ${requestId} removed. Updated list:`,
          this.matchRequests
        )
      } else {
        console.log(`Friend request with ID ${requestId} not found.`)
      }
    }
  }
})
