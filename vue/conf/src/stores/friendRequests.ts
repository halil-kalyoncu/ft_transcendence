import type { FriendshipEntryI } from '../model/friendship/friendshipEntry.interface'
import { defineStore } from 'pinia'

type FriendshipState = {
  friendRequests: FriendshipEntryI[]
}

export const useFriendRequestStore = defineStore('friendRequest', {
  state: (): FriendshipState => ({
    friendRequests: []
  }),

  actions: {
    addFriendRequest(newFriendRequests: FriendshipEntryI[]) {
      const uniqueRequests = newFriendRequests.filter(
        (request) =>
          !this.friendRequests.some((existingRequest) => existingRequest.id === request.id)
      )
      this.friendRequests.push(...uniqueRequests)
    },

    removeFriendRequestById(requestId: number) {
      const index = this.friendRequests.findIndex((request) => request.id === requestId)
      if (index !== -1) {
        this.friendRequests.splice(index, 1)
        console.log(
          `Friend request with ID ${requestId} removed. Updated list:`,
          this.friendRequests
        )
      } else {
        console.log(`Friend request with ID ${requestId} not found.`)
      }
    }
  }
})
