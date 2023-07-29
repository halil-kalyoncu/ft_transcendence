<script setup lang="ts">
import { ref, watch } from 'vue'
import { connectWebSocket } from '../../websocket'
import type { FriendshipEntryI } from '../../model/friendshipEntry.interface'
import type { UserI } from '../../model/user.interface'
import type { directMessageI } from '../../model/directMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'

const props = defineProps({
  selectedFriendEntry: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const selectedUser: UserI | null = props.selectedFriendEntry?.friend ?? null
const messages = ref<directMessageI[]>([])
const newMessage = ref('')

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectWebSocket('http://localhost:3000', accessToken)

const loading = ref(true)

//getting user from the access token, maybe do this differently
const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
const loggedUser: { id: number; username: string } = decodedToken.user as {
  id: number
  username: string
}

watch(
  () => props.selectedFriendEntry,
  (friendEntry) => {
    //remove
    console.log('changing friendEntry ' + friendEntry)
    if (!friendEntry) {
      return
    }

    console.log('frontend emit directMessage')
    socket.emit('directMessages', friendEntry.friend.id, (responseData: directMessageI[]) => {
      messages.value = responseData
      loading.value = false
    })
  }
)

socket.on('newDirectMessage', (newMessageData: directMessageI) => {
  messages.value.unshift(newMessageData)
})

const sendMessage = () => {
  if (newMessage.value.trim() === '' || !selectedUser) {
    return
  }

  socket.emit('sendDirectMessage', {
    senderId: loggedUser.id,
    receiverId: selectedUser.id,
    message: newMessage.value
  })
  newMessage.value = ''
}

const isOwnMessage = (senderId: number | undefined) => {
  return senderId !== undefined && senderId === loggedUser.id
}
</script>

<template>
  <div class="chat">
    <h2 v-if="selectedUser">{{ selectedUser.username }}</h2>
    <h2 v-else>User not selected</h2>
    <div class="messages" v-if="!loading" ref="chatContainerRef">
      <Message
        v-for="message in messages"
        :key="message.id"
        :directMessage="message"
        :isOwnMessage="isOwnMessage(message.sender.id)"
      />
    </div>
    <div v-else>Loading messages...</div>
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
  padding-top: 30px;
}

.chat .messages {
  display: flex;
  flex-direction: column-reverse;
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  height: calc(100% - 30px - 30px);
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
