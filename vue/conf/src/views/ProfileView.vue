<script setup lang="ts">
import Profile from '../components/profile/Profile.vue'
import { watch, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
let username = ref(route.params.username as string)

watch(route, () => {
  username.value = route.params.username as string
})
</script>

<template>
  <main>
    <Profile :username="username" />
  </main>
</template>
