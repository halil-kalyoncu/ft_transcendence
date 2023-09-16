<template>
  <div class="messages-container">
    <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'" class="messages-scrollviewer">
      <div class="messages">
        <Message
          v-for="channelmessage in channelMessages"
          :key="channelmessage.id"
          :createdAt="formatDate(channelmessage.createdAt)"
          :message="channelmessage.message?.message ?? ''"
          :sender="channelmessage.sender?.username ?? ''"
          :isOwnMessage="isOwnMessage(channelmessage.sender.id)"
        />
      </div>
    </ScrollViewer>
    <div class="chat-input">
      <textarea
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
import type { ErrorI } from '../../model/error.interface'

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
  socket.value.on('UserSignedOut', (userName: string) => {
    console.log('UserSignedOut from ChannelMessages fired')
    setNewChannelMessages()
  })
}

const setUserChangesListener = () => {
  if (!socket || !socket.value) {
	notificationStore.showNotification('Error: Connection problems', true)
	return
  }
  socket.value.on('UserSignedOut', (userSignedoutname: string, leftChannelId:number) => {
	if (leftChannelId === channelId)
	console.log('UserSignedOut from ChannelMessages fired')
	setNewChannelMessages()
  })
}

const setNewChannelMessages = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-message/getChannelMessagesforChannel?channelId=${channelId}`
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

onMounted(() => {
  initSocket()
  setNewChannelMessages()
  setNewChannelMessageListener()
  setUserChangesListener()
})

//Todo Check for selectedChannel after implementaiton

const sendChannelMessage = async () => {
	if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  if (newchannelMessages.value.trim() === '') {
    return
  }

  socket.value.emit('sendChannelMessage', {
    senderId: loggedUser.value.id,
    channelId: channelId,
    message: newchannelMessages.value
  }, (response: any | ErrorI ) =>{
	if ('error' in response){
		notificationStore.showNotification(response.error, false)
	}
  })
  newchannelMessages.value = ''
  return
}

const updateMutedUsers = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/channel/updateMutedUsers?channelId=${channelId}`,
	{
		method:'PATCH',
		headers: {
			'Content-Type': 'application/json'
		}
	})
    if (!response.ok) {
      throw new Error('Failed to add user to channel')
    }
	const data = await response.json()
	return data
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
  }
}

const checkForMutedUsers = async () => {
  const membersToUnmute = await updateMutedUsers()

  if (!socket || !socket.value) {
	notificationStore.showNotification(`Error: Connection problems`, true)
	return
  }
  if (membersToUnmute.length > 0) {
	socket.value.emit('sendUpdateUnMuted', membersToUnmute, (response: any | ErrorI ) =>{
		if ('error' in response){
			notificationStore.showNotification(response.error, false)
		}
	})
  }
  return
}

const sendMessage = async () => {
	await checkForMutedUsers()
	await sendChannelMessage()
}
</script>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  height: 40vh;
}

.messages-scrollviewer {
  flex-grow: 1;
}

.messages {
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem;
}

.chat-input {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  position: relative;
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

.chat-input button {
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

.chat-input button:hover {
  background-color: #ea9f42;
}
</style>
