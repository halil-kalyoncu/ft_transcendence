<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userInfo'
import { connectChatSocket } from '../websocket'
import jwtDecode from 'jwt-decode'
import { useNotificationStore } from '../stores/notification'
import Spinner from './utils/Spinner.vue'

const router = useRouter()
const route = useRoute()
const token = route.params.token as string
const notificationStore = useNotificationStore()

const userStore = useUserStore()

onMounted(async () => {
  try {
    const decodeParamToken = atob(token)

    localStorage.setItem('ponggame', decodeParamToken)

    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/auth/verify`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    if (response.ok) {
      await userStore.initStore()
      connectChatSocket(decodeParamToken)
      router.push('/home')
    } else {
      notificationStore.showNotification('Redirection failed: invalid token', false)
      router.push('/')
    }
  } catch (error) {
    notificationStore.showNotification('Redirection failed: invalid token', false)
    router.push('/')
  }
})
</script>

<template>
  <div class="login">
    <div class="waiting-container">
      <Spinner />
      <span>redirecting...</span>
    </div>
  </div>
</template>

<style>
.waiting-container {
  margin: 10% 0 0 22.5%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
