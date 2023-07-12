<script setup lang="ts">
import Chat from './Chat.vue'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { connectWebSocket, disconnectWebSocket } from '../websocket'
import { Socket } from 'socket.io-client'

const MyComponent = defineComponent({
  setup() {
    const socket = ref<Socket | null>(null)

    onMounted(() => {
      const accessToken = localStorage.getItem('ponggame') ?? ''

      socket.value = connectWebSocket('http://localhost:3000', accessToken)

      socket.value.on('connect', () => {
        console.log('Connected to WebSocket')
      })

      socket.value.on('disconnect', () => {
        console.log('Disconnected from WebSocket')
      })
    })

    onBeforeUnmount(() => {
      disconnectWebSocket()
    })

    return {
      socket
    }
  }
})

interface UserI {
  id?: number
  username?: string
}
</script>

<template>
  <MyComponent />
  <section class="friends">
    <div class="friendsList">
      <h1>Friends View</h1>
    </div>
    <Chat />
  </section>
</template>

<style>
.friends {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
}

.channels > * {
  flex: 1;
}
</style>
