<script setup lang="ts">
import { RouterView } from 'vue-router'

import SideBar from './SideBar.vue'
import TopNavBar from './TopNavBar.vue'
</script>

<template>
  <main>
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
