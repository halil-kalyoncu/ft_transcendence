<template>
  <section class="channels">
    <template v-if="!showAvailableChannels && !showJoinedChannels && !showChannelManagerAndChat">
      <button class="channel-option-button" @click="openModal">Create Channel</button>
      <Modal
        :isOpened="isModalOpened"
        :title="'Create a Channel'"
        :placeholderText="'Enter channel name'"
        :showVisibilitySelection="true"
        @submit="handleConfirm"
        @close="handleClose"
      />
      <button class="channel-option-button" @click="openJoinChannels">Join Channels</button>
      <button class="channel-option-button" @click="openMyChannels">My Channels</button>
    </template>
    <template v-else>
      <div class="back-button-container">
        <button class="back-button" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" /> 
        </button>
      </div>
      <AvailableChannels v-if="showAvailableChannels" @channel-entered="handleChannelEntered" />
      <JoinedChannels
        v-if="showJoinedChannels"
        :username="username"
        @channel-entered="handleChannelEntered"
      />
      <div v-if="showChannelManagerAndChat">
        <ChannelManager :channelId="joinedChannelId" />
        <!-- <Chat :channelId="joinedChannelId" /> -->
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import Chat from '../chat/Chat.vue'
import ChannelManager from './ChannelManager.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faArrowLeft)
import { onBeforeUnmount, onMounted, computed, watch, ref } from 'vue'
import { useUserStore } from '../../stores/username'
import { connectWebSocket, disconnectWebSocket } from '../../websocket'
import { ChannelVisibility } from '../../model/channels/createChannel.interface'
import { useNotificationStore } from '../../stores/notification'
import JoinedChannels from './JoinedChannelsList.vue'
import AvailableChannels from './AvailableChannelsList.vue'
import type {
  CreateChannelDto,
  ChannelVisibilityType
} from '../../model/channels/createChannel.interface'
import { Socket } from 'socket.io-client'
import Modal from '../utils/Modal.vue'

const notificationStore = useNotificationStore()

let socket: Socket | null = null
onMounted(() => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket = connectWebSocket('http://localhost:3000', accessToken)

  if (socket) {
    socket.on('channelCreated', (success: boolean) => {
      notificationStore.showNotification('Channel Succesfully Created!', true)
    })

    socket.on('error', (error: string) => {
      notificationStore.showNotification('Error: ' + error, false)
    })
  }
  console.log('socket')
})
onBeforeUnmount(() => {
  disconnectWebSocket()
})

const userStore = useUserStore()
const username = computed(() => userStore.username)

interface ModalResult {
  name: string
  password: string
  visibility: string
}

const isModalOpened = ref(false)
const openModal = () => {
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleConfirm = ({ name, password, visibility }: ModalResult) => {
  isModalOpened.value = false

  if (
    !Object.values(ChannelVisibility).includes(visibility.toUpperCase() as ChannelVisibilityType)
  ) {
    console.error(`Invalid channel visibility:: ${visibility.toUpperCase()}`)
    return
  }

  const createChannelDto: CreateChannelDto = {
    userId: 1,
    name: name,
    password: password,
    channelVisibility: visibility.toUpperCase() as ChannelVisibilityType
  }

  if (socket) {
    socket.emit('createChannel', createChannelDto)
  } else {
    console.error('Socket is not connected')
  }
  console.log(name, password, visibility)
}

const showChannelManagerAndChat = ref(false)
const joinedChannelId = ref(0)
const showAvailableChannels = ref(false)
const showJoinedChannels = ref(false)

const openJoinChannels = () => {
  showAvailableChannels.value = true
}

const openMyChannels = () => {
  showJoinedChannels.value = true
}

const closeJoinChannels = () => {
  showAvailableChannels.value = false
}

const closeMyChannels = () => {
  showJoinedChannels.value = false
}

const closeChannelManagerAndChat = () => {
  showChannelManagerAndChat.value = false
}

const goBack = () => {
  closeJoinChannels()
  closeMyChannels()
  closeChannelManagerAndChat()
}

const handleChannelEntered = (channelId: number) => {
  joinedChannelId.value = channelId
  closeJoinChannels()
  closeMyChannels()
  showChannelManagerAndChat.value = true
}
</script>

<style scoped>
.channels {
  height: calc(100% - 50px);
  padding: 1.5rem 0.5rem 0.5rem 0.5rem;
}
.channel-option-button {
  font-family: 'Courier New', Courier, monospace !important;
  display: block;
  width: calc(100%);
  margin: 0 0 1rem 0;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  background: transparent;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.25s color ease-out, border 0.25s ease-out;
}

.channel-option-button:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}

.channels .back-button-container {
  text-align: right;
}

.channels .back-button {
  background: none;
  border: 0.5px solid aliceblue;
  font-size: 0.75rem;
  font-weight: light;
  color: #fff;
  box-sizing: border-box;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: 0.25s color ease-out, border 0.25s ease-out;
  margin: 0 0 1rem 0;
}
.channels .back-button:hover {
  color: aliceblue;
  border: 0.5px solid #ea9f42;
  text-shadow: 0px 0px 1px aliceblue;
}
</style>
