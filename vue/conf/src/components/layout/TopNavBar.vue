<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/username'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import router from '../../router'

library.add(fas)

const userStore = useUserStore()
const username = computed(() => userStore.username)

const route = useRoute()
const showHomePage = computed(() => route.path === '/home')
const showProfilePage = computed(() => route.path.startsWith('/profile'))

const logout = () => {
  localStorage.removeItem('ponggame')
  userStore.clearUsername()
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
        <RouterLink
          class="navButton"
          :class="{ selected: showProfilePage }"
          :to="`/profile/${username}`"
          >Profile</RouterLink
        >
      </div>
      <RouterLink class="navButton header-username" :to="`/profile/${username}`">
        <div class="link-content">
          {{ username ? username : 'TBD' }}
          <img class="profile-image" src="../../assets/avatar-1.png" alt="Profile" />
        </div>
      </RouterLink>
      <div>
        <button class="settings-button">
          <font-awesome-icon class="icon" icon="cog" title="Settings" />
        </button>
        <a class="navButtonLogout" @click="logout" title="Logout">
          <font-awesome-icon class="icon" icon="sign-out-alt" />
        </a>
      </div>
    </nav>
  </header>
</template>

<style>
.header {
  width: calc(100vw - 300px);
  background-color: #1560bd;
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
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  color: lightgreen;
  padding: 0 0 0 1rem;
  transition: color 0.15s ease-in-out;
}

.navButtonLogout:hover,
.settings-button:hover {
  color: yellow;
}

.header-username {
  color: #ffff00;
  font-weight: light;
  font-family: Helvetica, sans-serif;
  padding: 0;
  text-align: bottom;
}

.settings-button {
  background-color: transparent;
  width: fit-content;
  border: none;
  margin-left: 5.4rem;
}

.settings-button .icon {
  color: lightgray;
}

.link-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem 0 1rem;
  background-color: #186dd6;
  border-radius: 0.5rem;
}

.link-content .profile-image {
  width: 2.75rem;
  height: 2.75rem;
  margin-left: 1rem;
  object-fit: cover;
}

.header .header-username:hover {
  color: yellow;
}
</style>
