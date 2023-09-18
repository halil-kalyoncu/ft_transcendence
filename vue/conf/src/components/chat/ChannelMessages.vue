<template>
  <div class="chat">
    <div></div>

    <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
      <div class="messages">
        <Message
          v-for="channelmessage in channelMessages"
          :key="channelmessage.id"
          :createdAt="formatDate(channelmessage.createdAt)"
          :message="channelmessage.message?.message ?? ''"
          :sender="channelmessage.sender?.username ?? ''"
          :isOwnMessage="isOwnMessage(channelmessage.sender.id)"
          :blockedGroupMessage="channelmessage.blockGroupMessage!"
        />
      </div>
    </ScrollViewer>
    <div class="chat-input">
      <textarea
        @keyup.enter.prevent="handleEnterKey($event)"
        v-model="newchannelMessages"
        placeholder="Type your message here..."
        rows="1"
      ></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { connectChatSocket } from '../../websocket'
import type { ChannelEntryI } from '../../model/channels/createChannel.interface'
import type { UserI } from '../../model/user.interface'
import type { ChannelMessageI } from '../../model/channels/channelMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'

const props = defineProps({
  channelId: {
    type: Number,
    required: true
  }
})

const channelId: Number = props.channelId
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed<string>(() => userStore.username)
const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const channelMessages = ref<ChannelMessageI[]>([])
const newchannelMessages = ref('')
const loading = ref(true)
//const selectedChannel = ref<ChannelEntryI | null>(null)

type User = {
  id: number
  username: string
}

const loggedUser = computed<User>(() => ({
  id: userId.value,
  username: username.value
}))

const isOwnMessage = (senderId: number | undefined) => {
  return senderId !== undefined && senderId === loggedUser.value.id
}
const formatDate = (createdAt: string) => {
  const date = new Date(createdAt)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${day}/${month}/${year} ${hours}:${minutes}`
}
const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const setNewChannelMessageListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('newChannelMessage', (newChannelMessageData: ChannelMessageI) => {
    console.log('newChannelMessage fired')
    setNewChannelMessages()
  })
  socket.value.on('UserSignedOut', (channelId: Number) => {
    console.log('UserSignedOut from ChannelMessages fired')
    notificationStore.showNotification(' Signed out Channel', true)
    setNewChannelMessages()
  })
}

const setNewChannelMessages = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-message/getChannelMessagesforChannel?channelId=${channelId}&userId=${userId.value}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    channelMessages.value = data
  } catch (error: any) {
    console.error('Error: ', error)
  } finally {
    loading.value = false
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    sendMessage()
    event.preventDefault()
  }
}

onMounted(() => {
  initSocket()
  setNewChannelMessages()
  setNewChannelMessageListener()
})

//Todo Check for selectedChannel after implementaiton
const sendMessage = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  if (newchannelMessages.value.trim() === '') {
    return
  }

  console.log(loggedUser.value.id + ' ' + channelId + ' ' + newchannelMessages.value)

  socket.value.emit('sendChannelMessage', {
    senderId: loggedUser.value.id,
    channelId: channelId,
    message: newchannelMessages.value
  })
  newchannelMessages.value = ''
}
</script>
