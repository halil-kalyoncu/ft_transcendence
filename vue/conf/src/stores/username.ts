import { ref, computed  } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref('')

  function setUsername(newUsername: string) {
    username.value = newUsername
  }

  function clearUsername(newUsername: string) {
    username.value = ''
  }

  return { username, setUsername, clearUsername }
})
