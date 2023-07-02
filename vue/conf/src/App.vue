<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Login from './components/Login.vue'
import SideBar from './components/SideBar.vue'
import TopNavBar from './components/TopNavBar.vue'

const route = useRoute()
const showLoginPage = computed(() => route.path === '/')
</script>

<template>
  <Login v-if="showLoginPage" />

  <main v-if="!showLoginPage">
    <SideBar />
    <section>
      <TopNavBar />
      <RouterView />
    </section>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: row;
  font-family: 'Courier New', Courier, monospace;
}
</style>
