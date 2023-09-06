import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref<string>('')
  const userId = ref<number>(0)
  const avatarImageData = ref<Blob | null>(null)

  function setUsername(newUsername: string) {
    username.value = newUsername
  }

  function clearUsername() {
    username.value = ''
  }

  function setUserId(newUserId: number) {
    userId.value = newUserId
  }

  function clearUserId() {
    userId.value = 0
  }

  function setAvatarImageData(data: Blob) {
    avatarImageData.value = data
  }

  function clearAvatarImageData() {
    avatarImageData.value = null
  }

  return {
    username,
    userId,
    avatarImageData,
    setUsername,
    clearUsername,
    setUserId,
    clearUserId,
    setAvatarImageData,
    clearAvatarImageData
  }
})
