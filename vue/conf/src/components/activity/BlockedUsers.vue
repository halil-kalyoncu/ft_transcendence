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
import { onMounted, computed, ref, watch } from 'vue'
import RequestItem from './RequestItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { Socket } from 'socket.io-client'
import { useNotificationStore } from '../../stores/notification'
import { useFriendRequestStore } from '../../stores/friendRequests'
import { connectWebSocket } from '../../websocket'
import type { BlockEntryI } from '../../model/users/blocked-users.interface'
import type { BlockUserDto } from '../../model/block-user.dto'
import type { UserI } from '../../model/user.interface'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const socket = ref<Socket | null>(null)
const userId = computed(() => userStore.userId)
const blockedUsers = ref<BlockEntryI[]>([])
const friendRequestStore = useFriendRequestStore()
const friendRequests = computed(() => friendRequestStore.friendRequests)
const username = computed(() => userStore.username)

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

onMounted(() => {
  initSocket()

  setBlockedUsersData()
})

watch(
  friendRequests,
  (newVal, oldVal) => {
    setBlockedUsersData()
  },
  { deep: true }
)

const handleUnblockUser = async (requestId: number, targetUserId: number, username: string) => {
  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  try {
    const blockUserDto: BlockUserDto = {
      userId: userId.value as number,
      targetUserId: targetUserId as number
    }
    const response = await fetch('http://localhost:3000/api/blockedUsers', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blockUserDto)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}: ${response.statusText}`)
    }
    notificationStore.showNotification('User ' + username + ' was unblocked', true)
    setBlockedUsersData()
  } catch (error: any) {
    notificationStore.showNotification('Error: ' + error.message, false)
  }
}

type User = {
  username: string
  requestId: number
}

const dummyUserData: User[] = Array.from({ length: 9 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  requestId: i
}))

const setBlockedUsersData = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/blockedUsers?userId=${userId.value}`)

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    blockedUsers.value = data
    console.log(data)
    console.log(blockedUsers.value)
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}
</script>

<style></style>
