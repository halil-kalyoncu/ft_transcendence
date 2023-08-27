<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { connectWebSocket } from '../../websocket'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'
import type { UserI } from '../../model/user.interface'
import type { directMessageI } from '../../model/message/directMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'

const props = defineProps({
  selectedFriendEntry: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed<string>(() => userStore.username)
const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const selectedUser: UserI | null = props.selectedFriendEntry?.friend ?? null
const messages = ref<directMessageI[]>([])
const newMessage = ref('')
const loading = ref(true)

type User = {
  id: number
  username: string
}

const loggedUser = computed<User>(() => ({
  id: userId.value,
  username: username.value
}))

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const setNewDirectMessageListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.on('newDirectMessage', (newMessageData: directMessageI) => {
    setDirectMessages()
  })
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

// const setDirectMessages = async () => {
//   if (!props.selectedFriendEntry || !props.selectedFriendEntry.friend) {
//     return
//   }
//   try {
//     const directConversationDto: DirectConverstationDto = {
//       readerUserId: userId.value as number,
//       withUserId: props.selectedFriendEntry?.friend?.id as number
//     }

//     const response = await fetch('http://localhost:3000/api/directMessages/markAsRead', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(directConversationDto)
//     })

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`)
//     }
//     const data = await response.json()
//     if (Array.isArray(data)) {
//       messages.value = data
//       console.log('FriendMessages')
//       console.log(messages.value)
//     } else {
//       console.error('Expected an array from the API but received:', data)
//     }
//   } catch (error: any) {
//     console.error('Expected an array from the API but received:', error)
//   } finally {
//     loading.value = false
//   }
// }

onMounted(() => {
  initSocket()
  setDirectMessages()
  setNewDirectMessageListener()
})

const sendMessage = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  if (newMessage.value.trim() === '' || !selectedUser) {
    return
  }

  socket.value.emit('sendDirectMessage', {
    senderId: loggedUser.value.id,
    receiverId: selectedUser.id,
    message: newMessage.value
  })
  newMessage.value = ''
}
const isOwnMessage = (senderId: number | undefined) => {
  return senderId !== undefined && senderId === loggedUser.value.id
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
      <textarea type="text" v-model="newMessage" placeholder="Type your message here..." rows="1" />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<style>
.chat {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: calc(100%);
  margin-top: 0.5rem;
}

.chat > div:first-child {
  flex-grow: 1;
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
  justify-content: flex-end;
  align-items: flex-end;
  position: relative;
}

.chat .chat-input input:focus {
  outline: solid 2px #ea9f42;
}
.chat .chat-input button {
  height: 100%;
  background-color: #32a852;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}
.chat .chat-input button:hover {
  background-color: #ea9f42;
}

.chat-input textarea {
  width: 100%;
  padding: 0.5rem 0.25rem;
  background-color: lightgray;
  resize: none;
}

.chat-input textarea:focus {
  outline: none;
}
.chat .loading-text {
  font-size: 0.8rem;
  padding-left: 0.75rem;
}
</style>
