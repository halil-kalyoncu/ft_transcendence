<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-for="(user, index) in dummyUserData" :key="index">
        <RequestItem
          :username="user.username"
          :requestId="user.requestId"
          :showAcceptRequest="false"
          :showRejectRequest="false"
          :showBlockUser="false"
          :showUnblockUser="true"
          @unblock-user="handleUnblockUser"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import RequestItem from './RequestItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { Socket } from 'socket.io-client'
import { useNotificationStore } from '../../stores/notification'
import { connectWebSocket } from '../../websocket'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const socket = ref<Socket | null>(null)

const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

onMounted(() => {
  initSocket()
})

const handleUnblockUser = (requestId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  notificationStore.showNotification(`You unblocked ${username}`, true)
}

type User = {
  username: string
  requestId: number
}

const dummyUserData: User[] = Array.from({ length: 9 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  requestId: i
}))
</script>

<style></style>
