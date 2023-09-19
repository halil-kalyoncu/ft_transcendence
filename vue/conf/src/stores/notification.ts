import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const show = ref<boolean>(false)
  const success = ref<boolean>(false)
  const message = ref<string>('')

  function showNotification(newMessage: string, newSuccess: boolean = false) {
    show.value = true
    message.value = newMessage
    success.value = newSuccess

    setTimeout(() => {
      show.value = false
      success.value = false
      message.value = ''
    }, 1750)
  }

  return { show, success, message, showNotification }
})
