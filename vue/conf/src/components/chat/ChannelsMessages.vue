<template>
  <div class="messages-container">
    <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'" class="messages-scrollviewer">
      <div class="messages">
        <Message
          v-for="(message, index) in channelMessages"
          :key="index"
          :isOwnMessage="message.isOwnMessage"
          :message="message.message"
          :createdAt="message.createdAt"
          :sender="message.sender"
        />
      </div>
    </ScrollViewer>
    <div class="chat-input">
      <textarea v-model="newMessage" placeholder="Type your message here..." rows="1"></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { connectWebSocket } from '../../websocket'
import type { UserI } from '../../model/user.interface'
import type { directMessageI } from '../../model/directMessage.interface'
import jwtDecode from 'jwt-decode'
import Message from './Message.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'

const channelMessages = ref([])
const inputMessage = ref('')

const fetchChannelMessages = async () => {
  const messages = getMockChannelMessages()
  channelMessages.value = messages
}

const getMockChannelMessages = () => {
  console.log('getMockChannelMessages')
  return [
    { message: 'Knock Knock', sender: 'Eric', createdAt: 'two minutes ago', isOwnMessage: false },
    { message: "Who's there?", sender: 'Clapton', createdAt: 'one minute ago', isOwnMessage: true },
    { message: 'Race Condition', sender: 'Eric', createdAt: 'one minute ago', isOwnMessage: false },
    {
      message:
        '... and a rather long text for testing purposes. To see if it would not distorttheviewinanyunexpected and unwanted way. \n ... and a bit more long text',
      sender: 'Eric',
      createdAt: 'one second ago',
      isOwnMessage: false
    }
  ]
}

onMounted(fetchChannelMessages)

const messages = ref<directMessageI[]>([])
const newMessage = ref('')

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectWebSocket('http://localhost:3000', accessToken)

const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
const loggedUser: { id: number; username: string } = decodedToken.user as {
  id: number
  username: string
}

socket.on('newDirectMessage', (newMessageData: directMessageI) => {
  messages.value.unshift(newMessageData)
})

const sendMessage = () => {
  newMessage.value = ''
}

const isOwnMessage = (senderId: number | undefined) => {
  return undefined
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
  background-color: #19c37d;
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
