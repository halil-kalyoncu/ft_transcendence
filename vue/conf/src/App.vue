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
  <Notification />
  <Login v-if="showLoginPage" />
  <RouterView v-if="!showLoginPage" />
</template>
