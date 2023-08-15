import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FriendshipEntryI } from '../model/friendship/friendshipEntry.interface'

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    friends: ref<FriendshipEntryI[]>([])
  }),
  getters: {},
  actions: {}
})
