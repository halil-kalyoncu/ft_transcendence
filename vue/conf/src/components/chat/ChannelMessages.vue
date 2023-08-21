<template>
	<div class="messages-container">
	  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'" class="messages-scrollviewer">
		<div class="messages">
		  <Message
			v-for="channelmessage in channelMessages"
			:key="channelmessage.id"
			:createdAt="'one minute ago'"
          	:message="channelmessage.message?.message ?? ''"
          	:sender="channelmessage.sender?.username ?? ''"
          	:isOwnMessage="isOwnMessage(channelmessage.sender.id)"
		  />
		</div>
	  </ScrollViewer>
	  <!-- <div class="chat-input">
		<textarea v-model="newMessage" placeholder="Type your message here..." rows="1"></textarea>
		<button @click="sendMessage">Send</button>
	  </div> -->

	 </div>
  </template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { connectWebSocket } from '../../websocket'
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
		},
})

const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed<string>(() => userStore.username)
const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const channelMessages = ref<ChannelMessageI[]>([])
const newchannelMessages = ref('')
const loading = ref(true)

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

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const setNewChannelMessageListener = () => {
	if(!socket || !socket.value) {
		notificationStore.showNotification('Error: Connection problems', true)
		return
	}
	//dafür muss einer darauf hören und etwas machen
	socket.value.on('newChannelMessage', (newChannelMessageData: ChannelMessageI) => {
		console.log('newChannelMessage fired')
		channelMessages.value.unshift(newChannelMessageData)
	})
}

const setNewChannelMessages = async () => {
	try{
		const response = await fetch ('http://localhost:3000//api/channel-message/getChannelMessagesforChannel?channelId=${props.channelId}')
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}
		const data = await response.json()
		channelMessages.value = data
	}
	catch (error: any)
	{
		console.error("Error: ", error)
	}
	finally {
		loading.value = false
	}
}

onMounted(() => {
	//initSocket()
	setNewChannelMessages()
	//setNewChannelMessageListener()
})
// // const setChannelMessages = async () => {
// // 	if (!selectedChannel) {
// // 		return
// // 	}
// // 	try {
// // 		const response = await fetch(`http://localhost:3000/api/directMessages/getDirectMessages?readerUserId=${userId.value}&withUserId=${props.selectedFriendEntry?.friend?.id}`)
// // 	}
// // }

// const fetchChannelMessages = () => {
//   const messages = getMockChannelMessages()
//   channelMessages.value = messages
// }

// const getMockChannelMessages = (): MockMessageI[] => {
//   return [
//     { message: 'Knock Knock', sender: 'Eric', createdAt: 'two minutes ago', isOwnMessage: false },
//     { message: "Who's there?", sender: 'Clapton', createdAt: 'one minute ago', isOwnMessage: true },
//     { message: 'Race Condition', sender: 'Eric', createdAt: 'one minute ago', isOwnMessage: false },
//     {
//       message:
//         '... and a rather long text for testing purposes. To see if it would not distort the view in any unexpected and unwanted way. \n ... and a bit more long text',
//       sender: 'Eric',
//       createdAt: 'one second ago',
//       isOwnMessage: false
//     }
//   ]
// }
// onMounted(() => {
//   initSocket()
//   fetchChannelMessages()
// })

// const messages = ref<directMessageI[]>([])
// const newMessage = ref('')

// const sendMessage = () => {
//   newMessage.value = ''
// }

// const isOwnMessage = (senderId: number | undefined) => {
//   return undefined
// }
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
  background-color: #ed901c;
}
</style>
