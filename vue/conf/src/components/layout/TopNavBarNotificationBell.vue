<template>
  <div>
    <RouterLink class="navButton header-username" to="/activity-center">
      <button class="settings-button" :class="'icon-wrapper'">
        <font-awesome-icon class="icon" icon="bell" title="Activity Center" />
        <span
          v-if="friendRequests?.length > 0 || matchInvites?.length > 0"
          class="notification-badge"
          >1+</span
        >
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Socket } from 'socket.io-client'
import { computed, ref, onMounted } from 'vue'
import type { MatchI } from '../../model/match/match.interface'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'
import { disconnectChatSocket, connectChatSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import { useFriendRequestStore } from '../../stores/friendRequests'
import { useMatchRequestsStore } from '../../stores/matchRequests'
import { useUserStore } from '../../stores/userInfo'
import router from '../../router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
const friendRequestsStore = useFriendRequestStore()
const friendRequests = computed(() => friendRequestsStore.friendRequests)

const socket = ref<Socket | null>(null)
const matchInvites = ref<MatchI[]>([])
const matchRequestsStore = useMatchRequestsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const username = computed(() => userStore.username)
const userId = computed(() => userStore.userId)
const hasNotification = ref(false)

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
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

  setFriendRequestListener()
  setMatchInviteListener()

  setFriendRequestData()
  setMatchInviteData()
})

const setMatchInviteListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('matchInvites', () => {
    setMatchInviteData()
  })
}

const setMatchInviteData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/matches/invites-by-userId?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    matchInvites.value = data
    if (data && data.length > 0) {
      hasNotification.value = true
    }
    matchRequestsStore.setMatchRequests(matchInvites.value)
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const setFriendRequestData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friendships/get-friend-requests?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data && data.length > 0) {
      hasNotification.value = true
    }

    friendRequestsStore.addFriendRequest(data)
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const setFriendRequestListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('friendRequests', () => {
    setFriendRequestData()
  })
}
</script>

<style>
.icon-wrapper {
  position: relative;
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: 0.15rem;
  right: -0.25rem;
  color: aliceblue;
  font-size: 0.5rem;
  padding: 0.1px 0.1px 0 0;
  background-color: red;
  border-radius: 5%;
}
</style>
