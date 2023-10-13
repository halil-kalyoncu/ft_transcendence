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
      this.friendRequests = newFriendRequests
    },

    removeFriendRequestById(requestId: number) {
      const index = this.friendRequests.findIndex((request) => request.id === requestId)
      if (index !== -1) {
        this.friendRequests.splice(index, 1)
      }
    }
  }
})
