<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userInfo'
import { connectChatSocket } from '../websocket'
import jwtDecode from 'jwt-decode'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const route = useRoute()
const token = route.params.token as string
const notificationStore = useNotificationStore()

const userStore = useUserStore()

onMounted(async () => {
  try {
    const decodeParamToken = atob(token)
    const decodedToken: Record<string, unknown> = jwtDecode(decodeParamToken)

    localStorage.setItem('ponggame', decodeParamToken)
    await userStore.initStore()
    connectChatSocket(decodeParamToken)
    router.push('/home')
  } catch (error) {
    notificationStore.showNotification('Redirection failed: invalid token', false)
    router.push('/')
  }
})
</script>

<template>You are being redirected</template>
