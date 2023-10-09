<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="matchRequests && matchRequests.length">
        <div v-for="request in matchRequests" :key="request.id">
          <RequestItem
            v-if="isValidRequest(request)"
            :username="request.leftUser?.username"
            :requestId="request.id"
            :targetUserId="request.leftUser?.id"
            :showAcceptRequest="true"
            :showRejectRequest="true"
            :showBlockUser="false"
            :showUnblockUser="false"
            @accept-request="handleAcceptGameRequest"
            @reject-request="handleRejectGameRequest"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">No Pending Game Requests</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import RequestItem from './RequestItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { useMatchRequestsStore } from '../../stores/matchRequests'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import { useRouter } from 'vue-router'
import type { MatchI } from '../../model/match/match.interface'
import type { ErrorI } from '../../model/error.interface'

const matchRequestStore = useMatchRequestsStore()
const matchRequests = computed(() => matchRequestStore.matchRequests)
const router = useRouter()

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const socket = ref<Socket | null>(null)
const props = defineProps({
  channelId: Number
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

onMounted(() => {
  initSocket()

  socket.value
})

const isValidRequest = (request: any) => {
  return request && request.leftUser && request.leftUser.username
}

const handleAcceptGameRequest = (requestId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('acceptMatchInvite', requestId, (response: MatchI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        `You accepted ${response.leftUser?.username}'s game request`,
        true
      )
      router.push(`/invite/${requestId}`)
    }
  })
}

const handleRejectGameRequest = (requestId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('rejectMatchInvite', requestId, (response: MatchI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        `You rejected ${response.leftUser?.username}'s game request`,
        true
      )
    }
  })
}
</script>

<style>
.friend-requests {
  padding: 1.5rem 0 0 0;
}

.empty-list-info {
  color: lightgray;
}
</style>
