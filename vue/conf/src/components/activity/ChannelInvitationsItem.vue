<template>
  <div class="friend-request-item">
    <div class="friend-info">
      <font-awesome-icon
        v-if="isPasswordProtected"
        class="icon margin-right"
        :icon="['fas', 'lock']"
      />
      <p>{{ channelName }}</p>
      <div class="friend-info margin-left" @click="viewProfile">
        <p>[</p>
        <p class="friend-username small-font">{{ username }}</p>
        <p class="margin-left">]</p>
      </div>
    </div>

    <div class="request-actions">
      <button class="icon-button-accept" @click="acceptRequest" title="Accept">
        <font-awesome-icon :icon="['fas', 'check']" />
      </button>
      <button class="icon-button-reject" @click="rejectRequest" title="Reject">
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { connectWebSocket } from '../../websocket'
import { Socket } from 'socket.io-client'

import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'

library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)

const props = defineProps({
  username: String,
  channelName: String,
  isPasswordProtected: Boolean,
  invitationId: Number
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

onMounted(() => {
	initSocket()
})

const viewProfile = () => {
  router.push(`/profile/${props.username}`)
}

const acceptRequest = () => {
	if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  socket.value.emit('acceptChannelInvitation', props.invitationId)
  notificationStore.showNotification(`You joined ${props.channelName} channel`, true)
  
}

const rejectRequest = () => {
	if (!socket || !socket.value) {
	notificationStore.showNotification(`Error: Connection problems`, true)
	return
  }

  socket.value.emit('rejectChannelInvitation', props.invitationId)
  notificationStore.showNotification(`You declined ${props.channelName} channel invitation`, true)
}

</script>

<style>
.small-font {
  font-size: 0.75rem;
}

.margin-left {
  margin-left: 0.5rem;
}

.margin-right {
  margin-right: 0.5rem;
}
</style>