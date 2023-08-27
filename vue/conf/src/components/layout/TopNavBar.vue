<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import router from '../../router'
import { disconnectWebSocket, connectWebSocket } from '../../websocket'
import { Socket } from 'socket.io-client'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'

library.add(fas)
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const username = computed(() => userStore.username)
const userId = computed(() => userStore.userId)
const userAvatar = computed(() => userStore.avatarImageData)
const socket = ref<Socket | null>(null)
const route = useRoute()
const showHomePage = computed(() => route.path === '/home')
const hasNotification = ref(false)
const friendRequests = ref<FriendshipEntryI[]>([])

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

onMounted(() => {
  initSocket()

  setFriendRequestListener()
  setMatchInviteListener()
})

const logout = () => {
  localStorage.removeItem('ponggame')
  userStore.clearUsername()
  disconnectWebSocket()
  router.push('/')
}

const setMatchInviteListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('matchInvites', () => {
    console.log('matchInvites listener fired')
    hasNotification.value = true

    // setMatchInviteData()
  })
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
    friendRequests.value = data
    hasNotification.value = true
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
    console.log('friendRequests listener fired')
    setFriendRequestData()
  })
}
</script>

<template>
  <header class="header">
    <nav>
      <div>
        <RouterLink class="navButton" to="/home" :class="{ selected: showHomePage }"
          >Home</RouterLink
        >
      </div>
      <div class="flex-box-center">
        <RouterLink class="navButton header-username" :to="`/profile/${username}`">
          <div class="link-content">
            {{ username ? username : 'TBD' }}
            <img class="profile-image" src=../../assets/defaultAvatar.png alt="Profile" />
          </div>
        </RouterLink>
        <RouterLink class="navButton header-username" to="/activity-center">
          <button class="settings-button" :class="'icon-wrapper'">
            <font-awesome-icon class="icon" icon="bell" title="Activity Center" />
            <span v-if="friendRequests?.length > 0" class="notification-badge">1+</span>
          </button>
        </RouterLink>
        <RouterLink class="navButton header-username" to="/settings">
          <button class="settings-button">
            <font-awesome-icon class="icon" icon="cog" title="Settings" />
          </button>
        </RouterLink>
        <a class="navButtonLogout" @click="logout" title="Logout">
          <font-awesome-icon class="icon" icon="sign-out-alt" />
        </a>
      </div>
    </nav>
  </header>
</template>

<style>
.flex-box-center {
  display: flex;
  align-items: center;
}
.header {
  width: calc(100vw - 300px);
  background: rgba(0, 0, 0, 0.75);
  border-bottom: 0.25px solid darkgray;
}

.header nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 1rem;
}

.header nav a {
  text-decoration: none;
}

.navButtonLogout,
.settings-button {
  font-size: 1rem;
  cursor: pointer;
  color: #ce4431;
  padding: 0 0 0 0.75rem;
  transition: color 0.15s ease-in-out;
}

.navButtonLogout:hover,
.settings-button:hover {
  color: red;
}

.header-username {
  color: #ea9f42;
  font-weight: light;
  font-family: Helvetica, sans-serif;
  padding: 0;
  text-align: bottom;
}

.header-username:hover {
  color: #ea9f42;
}

.settings-button {
  background-color: transparent;
  width: fit-content;
  border: none;
}

.settings-button .icon {
  color: lightgray;
}

.link-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border-radius: 0.5rem;
}

.link-content .profile-image {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  object-fit: cover;
}

.header .header-username:hover {
  color: red;
}

.header .icon-wrapper {
  position: relative;
  display: inline-block;
}

.header .notification-badge {
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
