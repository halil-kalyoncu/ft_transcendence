<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import router from '../../router'
import { disconnectChatSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'
import NotificationBell from './TopNavBarNotificationBell.vue'

library.add(fas)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const username = computed(() => userStore.username)
const userAvatar = computed(() => userStore.avatarImageData)
const route = useRoute()
const showHomePage = computed(() => route.path === '/home')
const notificationStore = useNotificationStore()

const avatarSrc = computed(() => {
  if (userAvatar.value === null) {
    //can't happen because it is checked before calling this function, but vue needs the null check
    return ''
  }
  return URL.createObjectURL(userAvatar.value)
})

const logout = () => {
  localStorage.removeItem('ponggame')
  router.push('/')
  userStore.clearStore()
  setTimeout(() => {
    disconnectChatSocket()
  }, 1000)
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
})
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
        <RouterLink class="navButton header-username" :to="`/profile/${userId.toString()}`">
          <div class="link-content">
            {{ username ? username : 'Legend' }}
            <img v-if="userAvatar" class="profile-image" :src="avatarSrc" alt="Profile" />
            <img v-else class="profile-image" src="../../assets/defaultAvatar.png" alt="Profile" />
          </div>
        </RouterLink>
        <NotificationBell />
        <RouterLink class="navButton header-username" to="/settings" :class="'button-hover'">
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
  min-width: 700px;
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
.button-hover:hover {
  color: red;
}

.settings-button .icon {
  transition: color 0.15s ease-in-out;
}

.settings-button:hover .icon,
.navButton:hover .settings-button {
  color: #5a5a5a;
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
  color: gold;
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
