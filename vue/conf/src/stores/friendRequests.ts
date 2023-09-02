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
      newFriendRequests.forEach((request) => {
        if (!this.friendRequests.includes(newFriendRequests[0])) {
          this.friendRequests.push(request)
        }
      })
    },

    setFriendOnlineStatus(id: number, status: boolean) {
      const friend = this.friendRequests.find((friendRequest) => friendRequest.id === id)
      if (friend) {
        friend.isOnline = status
      }
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
