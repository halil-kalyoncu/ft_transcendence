<script setup lang="ts">
import Chat from './Chat.vue'
import { computed, watch } from 'vue'
import { useUserStore } from '../stores/username'

const userStore = useUserStore()
const username = computed(() => userStore.username)
</script>

<template>
  <section class="channels">
    <h1>Channels View</h1>
    <Chat />
  </section>
</template>

<style>
.channels {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
}

.channels > * {
  flex: 1;
}
</style>
