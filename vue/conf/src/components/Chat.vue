<script setup lang="ts">
import { ref, watch } from 'vue'
import { connectWebSocket } from '../websocket'
import type { FriendshipEntryI } from '../model/friendshipEntry.interface'
import type { UserI } from '../model/user.interface'
import type { directMessageI } from '../model/directMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'

const props = defineProps({
  friend: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const user: UserI | null = props.friend?.friend ?? null
const messages = ref<directMessageI[]>([])
const newMessage = ref('')

watch(
  () => props.friend,
  async (newFriend) => {
    if (newFriend) {
      const accessToken = localStorage.getItem('ponggame') ?? ''
      const socket = connectWebSocket('http://localhost:3000', accessToken)

      socket.emit('directMessages', newFriend.friend.id, (responseData: directMessageI[]) => {
        messages.value = responseData
      })
    }
  }
)

const sendMessage = () => {
  if (newMessage.value.trim() === '' || !user) {
    return
  }

  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)
  //maybe do this differently
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  const loser: { id: number; username: string } = decodedToken.user as {
    id: number
    username: string
  }
  socket.emit('sendDirectMessage', {
    senderId: loser.id,
    receiverId: user.id,
    message: newMessage.value
  })
  socket.emit('directMessages', user.id, (responseData: directMessageI[]) => {
    messages.value = responseData
  })
  newMessage.value = ''
}
</script>

<template>
  <div class="chat">
    <h2 v-if="user">{{ user.username }}</h2>
    <h2 v-else>User not selected</h2>
    <div class="messages">
      <Message v-for="message in messages" :key="message.id" :directMessage="message" />
    </div>
    <div class="chat-input">
      <input type="text" v-model="newMessage" placeholder="Type your message here..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<style>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 20px;
}

.chat .messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 0 auto;
}

.chat .chat-input {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0.5rem;
  position: relative;
}

.chat .chat-input input {
  width: 100%;
  padding: 0.5rem 0.25rem;
  background-color: lightgray;
  border-radius: 0.25rem;
}

.chat .chat-input input:focus {
  outline: solid 2px #ea9f42;
}

.chat .chat-input button {
  position: absolute;
  right: 1rem;
  background-color: #ea9f42;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: 0.3s;
}

.chat .chat-input button:hover {
  background-color: #ed901c;
}
</style>
