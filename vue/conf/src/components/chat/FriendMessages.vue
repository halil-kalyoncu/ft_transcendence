<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { connectChatSocket } from '../../websocket'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'
import type { UserI } from '../../model/user.interface'
import type { directMessageI } from '../../model/message/directMessage.interface'
import Message from './Message.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
  socket.value = connectChatSocket(accessToken)
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
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/directMessages/getDirectMessages?readerUserId=${userId.value}&withUserId=${
        props.selectedFriendEntry?.friend?.id
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      if (Array.isArray(responseData)) {
        messages.value = responseData
      } else {
        notificationStore.showNotification(
          'Something went wrong while fetching direct messages',
          false
        )
      }
    } else {
      notificationStore.showNotification(
        'Error while fetching direct messages: ' + responseData.message,
        false
      )
    }
  } catch (error: any) {
    notificationStore.showNotification('Something went wrong while fetching direct messages', false)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await userStore.mountStore()
  } catch (error) {
    notificationStore.showNotification(
      "We're sorry, but it seems there was an issue initializing your user data. Please sign out and try logging in again. If the problem persists, please get in touch with a site administrator for assistance.",
      false
    )
    return
  }

  initSocket()
  setDirectMessages()
  setNewDirectMessageListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }

  socket.value.off('newDirectMessage')
})

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    sendMessage()
    event.preventDefault()
  }
}

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

const formatDate = (createdAt: Date) => {
  const date = new Date(createdAt)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${day}/${month}/${year} ${hours}:${minutes}`
}
</script>

<template>
  <div v-if="props.selectedFriendEntry?.blocked!" class="blocked-friend">
    <font-awesome-icon :icon="['fas', 'ban']" class="blocked-icon" />
  </div>
  <div class="chat">
    <div></div>
    <ScrollViewer :maxHeight="'60vh'" :class="{ blur: props.selectedFriendEntry?.blocked }">
      <div class="messages" v-if="!loading" ref="chatContainerRef">
        <Message
          v-for="message in messages"
          :key="message.id"
          :createdAt="formatDate(message.message?.createdAt ?? new Date())"
          :message="message.message?.message ?? ''"
          :sender="message.sender?.username ?? ''"
          :isOwnMessage="isOwnMessage(message.sender.id)"
          :blockedGroupMessage="false"
        />
      </div>
      <div v-else class="loading-text">Type to Start Conversation...</div>
    </ScrollViewer>
    <div class="chat-input" :class="{ blur: props.selectedFriendEntry?.blocked }">
      <textarea
        type="text"
        v-model="newMessage"
        placeholder="Type your message here..."
        rows="1"
        @keyup.enter.prevent="handleEnterKey($event)"
      />
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
  background-color: transparent;
  color: aliceblue;
  resize: none;
}

.chat-input textarea:focus {
  outline: none;
}

.chat .loading-text {
  font-size: 0.8rem;
  padding-left: 0.75rem;
}

.blur {
  filter: blur(7.5px);
  -moz-filter: blur(7.5px);
  -webkit-filter: blur(7.5px);
  pointer-events: none;
  user-select: none;
}

.blocked-friend {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a83232;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.blocked-icon {
  font-size: 6rem;
}
</style>
