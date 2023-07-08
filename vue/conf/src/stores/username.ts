import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref('')

  function setUsername(newUsername: string) {
    username.value = newUsername;
  }

  return { username, setUsername }
});