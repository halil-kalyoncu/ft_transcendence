<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showLoginPage = computed(() => route.path === '/')
</script>

<template>
  <main>
    <RouterView />
    <RouterLink class="goToLogin" to="/">Go To Login</RouterLink>
  </main>
</template>

<style scoped>
main {
  font-family: 'Courier New', Courier, monospace;
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
}

.goToLogin {
  display: block;
  text-align: center;
  color: aliceblue;
  text-decoration: none;
  transition: 0.15s color ease-out;
}

.goToLogin:hover {
  color: #ffff00;
}
</style>
