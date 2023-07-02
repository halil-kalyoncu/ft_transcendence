<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showHomePage = computed(() => route.path === '/home')
const showProfilePage = computed(() => route.path === '/profile')
</script>

<template>
  <header class="header">
    <nav>
      <RouterLink class="navButton" to="/home" :class="{ selected: showHomePage }">Home</RouterLink>
      <RouterLink class="navButton" :class="{ selected: showProfilePage }" to="/profile"
        >Profile</RouterLink
      >
      <RouterLink class="navButtonLogout" to="/">Logout</RouterLink>
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
  justify-content: flex-end;
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
}

.selecteNew {
  color: pink !important;
}
</style>
