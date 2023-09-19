<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="blockedUsers && blockedUsers.length">
        <div v-for="(user, index) in blockedUsers" :key="index">
          <RequestItem
            :username="user.targetUser.username"
            :requestId="user.targetUserId"
            :targetUserId="user.targetUserId"
            :showAcceptRequest="false"
            :showRejectRequest="false"
            :showBlockUser="false"
            :showUnblockUser="true"
            @unblock-user="handleUnblockUser"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">You have not blocked any users</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch, onBeforeUnmount } from 'vue'
import RequestItem from './RequestItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { Socket } from 'socket.io-client'
import { useNotificationStore } from '../../stores/notification'
import { connectChatSocket } from '../../websocket'
import type { BlockEntryI } from '../../model/users/blocked-users.interface'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const socket = ref<Socket | null>(null)
const userId = computed(() => userStore.userId)
const blockedUsers = ref<BlockEntryI[]>([])

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const setBlockedUserListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.on('blockedUsers', () => {
    setBlockedUsersData()
  })
}

onMounted(async () => {
  try {
    await userStore.mountStore()
  } catch (error) {
    notificationStore.showNotification(
      "We're sorry, but it seems there was an issue initializing your user data. Please sign out and try logging in again. If the problem persists, please get in touch with a site administrator for assistance.",
      false
    )
    return
  }

  initSocket()

  setBlockedUsersData()
  setBlockedUserListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.off('blockedUsers')
})

const handleUnblockUser = async (unblockUserId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  socket.value.emit('unblockUser', unblockUserId as number, (response: any) => {
    if ('error' in response) {
      notificationStore.showNotification(`Error: ${response.error}`, false)
    } else {
      notificationStore.showNotification(`User ${username} was successfully unblocked`, true)
    }
  })
}

const setBlockedUsersData = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/blockedUsers?userId=${userId.value}`)

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    blockedUsers.value = data
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}
</script>

<style></style>
