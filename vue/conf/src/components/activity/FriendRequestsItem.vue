<template>
  <div class="friend-request-item">
    <div class="friend-info" @click="viewProfile">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-username">{{ username }}</p>
    </div>
    <div class="request-actions">
      <button class="icon-button-accept" @click="acceptFriendRequest" title="Accept">
        <font-awesome-icon :icon="['fas', 'check']" />
      </button>
      <button class="icon-button-reject" @click="rejectFriendRequest" title="Reject">
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
      <button class="icon-button-view-profile" @click="viewProfile" title="View Profile">
        <font-awesome-icon :icon="['fas', 'eye']" />
      </button>
      <button class="icon-button-block" @click="blockUser" title="Block">
        <font-awesome-icon :icon="['fas', 'ban']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { Socket } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'
import { connectChatSocket } from '../../websocket'
import type { FriendshipI } from '../../model/friendship/friendship.interface'
import type { ErrorI } from '../../model/error.interface'

library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)

const emit = defineEmits(['remove-friend-request'])

const props = defineProps({
  username: String,
  requestId: Number
})

const viewProfile = () => {
  router.push(`/profile/${props.username}`)
}

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

onMounted(() => {
  initSocket()
})

const acceptFriendRequest = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('acceptFriendRequest', props.requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(`You accepted ${props.username}'s friend request`, true)
      emit('remove-friend-request', props.requestId)
    }
  })
}

const rejectFriendRequest = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.emit('rejectFriendRequest', props.requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(`You rejected ${props.username}'s friend request`, true)
      emit('remove-friend-request', props.requestId)
    }
  })
}

const blockUser = () => {
  notificationStore.showNotification(`You blocked ${props.username}`, true)
}
</script>

<style>
.friend-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid aliceblue;
  padding: 0.5rem 1rem;
  min-width: 540px;
  margin: 0 0 0.5rem 0;
}

.friend-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.friend-username {
  margin-left: 0.5rem;
  color: #ea9f42;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.icon-button-accept,
.icon-button-reject,
.icon-button-view-profile,
.icon-button-block,
.icon-button-unblock {
  background: none;
  border: none;
  cursor: pointer;
  color: #e47264;
  padding: 5px;
}

.icon-button-accept {
  color: green;
}

.icon-button-reject {
  color: red;
}

.icon-button-block {
  color: #a83232;
}

.icon-button-view-profile {
  color: aliceblue;
}

.icon-button-unblock {
  color: green;
}
</style>
