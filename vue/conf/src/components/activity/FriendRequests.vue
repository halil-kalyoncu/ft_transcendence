<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="friendRequests && friendRequests.length">
        <div v-for="request in friendRequests" :key="request.id">
          <RequestItem
            v-if="isValidRequest(request)"
            :username="request.friend.username"
            :requestId="request.id"
            :targetUserId="request.friend.id"
            :showAcceptRequest="true"
            :showRejectRequest="true"
            :showBlockUser="true"
            :showUnblockUser="false"
            @reject-request="handleRejectFriendRequest"
            @accept-request="handleAcceptFriendRequest"
            @block-user="handleBlockUser"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">No Pending Friend Requests</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import RequestItem from './RequestItem.vue'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { useFriendRequestStore } from '../../stores/friendRequests'
import type { FriendshipI } from '../../model/friendship/friendship.interface'
import type { ErrorI } from '../../model/error.interface'
import type { UserI } from '../../model/user.interface'

const friendRequestStore = useFriendRequestStore()
const friendRequests = computed(() => friendRequestStore.friendRequests)

const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

onMounted(() => {
  initSocket()
})

const props = defineProps({
  channelId: Number
})

const isValidRequest = (request: any) => {
  return request && request.friend && request.friend.username
}

const handleAcceptFriendRequest = (requestId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('acceptFriendRequest', requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(`You accepted ${username}'s friend request`, true)
    }
  })

  friendRequestStore.removeFriendRequestById(requestId)
}

const handleRejectFriendRequest = (requestId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('rejectFriendRequest', requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(`You rejected ${username}'s friend request`, true)
    }
  })

  friendRequestStore.removeFriendRequestById(requestId)
}

const handleBlockUser = async (blockedUserId: number, username: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  if (username !== '') {
    socket.value.emit('blockUser', blockedUserId as number, (response: any) => {
      if ('error' in response) {
        notificationStore.showNotification(`Error: ${response.error}`, false)
      } else {
        notificationStore.showNotification(`You banned ${username}`, true)
      }
    })
  }
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
