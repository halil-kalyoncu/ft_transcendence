<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/userInfo'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import router from '../../router'
import { disconnectWebSocket } from '../../websocket'

library.add(fas)

const userStore = useUserStore()
const username = computed(() => userStore.username)
const userAvatar = computed(() => userStore.avatarImageData)

const route = useRoute()
const showHomePage = computed(() => route.path === '/home')

const logout = () => {
  localStorage.removeItem('ponggame')
  userStore.clearUsername()
  disconnectWebSocket()
  router.push('/')
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
          <button class="settings-button">
            <font-awesome-icon class="icon" icon="bell" title="Activity Center" />
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
</style>
