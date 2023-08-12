<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { connectWebSocket } from '../../websocket'
import type { FriendshipEntryI } from '../../model/friendshipEntry.interface'
import type { UserI } from '../../model/user.interface'
import type { directMessageI } from '../../model/directMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'

const props = defineProps({
  selectedFriendEntry: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
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

const setDirectMessages = async () => {
  if (!props.selectedFriendEntry || !props.selectedFriendEntry.friend) {
    return
  }
  try {
    const response = await fetch(
      `http://localhost:3000/api/directMessages/getDirectMessages?readerUserId=${userId.value}&withUserId=${props.selectedFriendEntry?.friend?.id}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    if (Array.isArray(data)) {
      messages.value = data
    } else {
      console.error('Expected an array from the API but received:', data)
    }
  } catch (error: any) {
    console.error('Expected an array from the API but received:', error)
  } finally {
    loading.value = false
  }
}

onMounted(setDirectMessages)

socket.on('newDirectMessage', (newMessageData: directMessageI) => {
  messages.value.unshift(newMessageData)
})

const sendMessage = () => {
  if (newMessage.value.trim() === '' || !selectedUser) {
    return
  }

  console.log(loggedUser.id + ' ' + selectedUser.id + ' ' + newMessage.value)

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
    <div></div>
    <ScrollViewer :maxHeight="'60vh'" class="messages-scrollviewer">
      <div class="messages" v-if="!loading" ref="chatContainerRef">
        <Message
          v-for="message in messages"
          :key="message.id"
          :createdAt="'one minute ago'"
          :message="message.message?.message ?? ''"
          :sender="message.sender?.username ?? ''"
          :isOwnMessage="isOwnMessage(message.sender.id)"
        />
      </div>
      <div v-else class="loading-text">Type to Start Conversation...</div>
    </ScrollViewer>
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
  justify-content: flex-start; /* Aligns items to the start of the flex container */
  height: calc(100%);
  margin-top: 0.5rem;
}

.chat > div:first-child {
  flex-grow: 1; /* This pushes the rest of the items to the bottom */
}

.chat .messages-scrollviewer {
}

.chat .messages {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  padding: 10px;
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
  transition: 0.3s;
}
.chat .chat-input button:hover {
  background-color: #ed901c;
}

.chat .loading-text {
  font-size: 0.8rem;
  padding-left: 0.75rem;
}
</style>
