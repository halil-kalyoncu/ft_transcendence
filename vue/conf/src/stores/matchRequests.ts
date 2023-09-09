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
    addMatchRequest(newMatchRequest: MatchI[]) {
      newMatchRequest.forEach((request) => {
        const index = this.matchRequests.findIndex(
          (existingRequest) => existingRequest?.leftUser?.username === request?.leftUser?.username
        )
        if (index !== -1) {
          this.matchRequests.splice(index, 1)
        }
      })

      // Step 2: Filter and add unique requests as per your original logic
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
