import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref<string>('')
  const userId = ref<Number>(0)

  function setUsername(newUsername: string) {
    username.value = newUsername
  }

  function clearUsername() {
    username.value = ''
  }

  function setUserId(newUserId: Number) {
    userId.value = newUserId
  }

  function clearUserId() {
    userId.value = 0
  }

  return { username, userId, setUsername, clearUsername, setUserId, clearUserId }
})
