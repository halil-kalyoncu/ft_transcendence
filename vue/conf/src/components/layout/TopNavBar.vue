<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/username'
import router from '../../router'

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
      <div>
        <RouterLink class="navButton header-username" :to="`/profile/${username}`">{{
          username ? username : 'TBD'
        }}</RouterLink>
        <a class="navButtonLogout" @click="logout">Logout</a>
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

.navButtonLogout {
  padding: 0.5rem;
  font-size: 1rem;
  color: #747c86;
  cursor: pointer;
  color: #ea9f42;
  padding: 0 0 0 1rem;
  transition: color 0.15s ease-in-out;
}

.navButtonLogout:hover {
  color: red;
}

.header-username {
  color: #ffff00;
  font-weight: light;
  font-family: Helvetica, sans-serif;
  padding: 0;
  text-align: bottom;
}
</style>