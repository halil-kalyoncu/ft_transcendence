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
      <AvailableChannels 
	  v-if="showAvailableChannels" 
	  @channel-entered="handleChannelEntered" />
      <JoinedChannels
        v-if="showJoinedChannels"
        :username="username"
        @channel-entered="handleChannelEntered"
      />
      <div v-if="showChannelManagerAndChat">
        <ChannelManager :channelId="joinedChannelId" @channel-left="handleChannelLeft" @channel-signedout="hanndleChannelSignedout" />
        <ChannelMessages :channelId = "joinedChannelId" />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import ChannelManager from './ChannelManager.vue'
import ChannelMessages from '../chat/ChannelMessages.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faArrowLeft)
import { onBeforeUnmount, onMounted, computed, watch, ref } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import { connectWebSocket, disconnectWebSocket } from '../../websocket'
import { ChannelVisibility } from '../../model/channels/createChannel.interface'
import { useNotificationStore } from '../../stores/notification'
import JoinedChannels from './JoinedChannelsList.vue'
import AvailableChannels from './AvailableChannelsList.vue'
import type {
  CreateChannelDto,
  ChannelVisibilityType,
  ChannelMemberI
} from '../../model/channels/createChannel.interface'
import { Socket } from 'socket.io-client'
import Modal from '../utils/Modal.vue'

const notificationStore = useNotificationStore()
const socket = ref <Socket | null >(null)

onMounted(() => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)

  if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
    socket.value.on('channelCreated', (success: boolean) => {
      notificationStore.showNotification('Channel Succesfully Created!', true)
    })

    socket.value.on('error', (error: string) => {
      notificationStore.showNotification('Error: ' + error, false)
    })
  })
onBeforeUnmount(() => {
  disconnectWebSocket()
})

const userStore = useUserStore()
const username = computed(() => userStore.username)
const userId = computed(() => userStore.userId)

interface ModalResult {
  name?: string
  password?: string
  visibility?: string
  minutesOfMute?: number
}

const isModalOpened = ref(false)
const openModal = () => {
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleConfirm = ({ name, password, visibility, minutesOfMute }: ModalResult) => {
  isModalOpened.value = false
  if (visibility === undefined) {
    visibility = ChannelVisibility.PUBLIC
  }
  if (
    !Object.values(ChannelVisibility).includes(visibility.toUpperCase() as ChannelVisibilityType)
  ) {
    console.error(`Invalid channel visibility:: ${visibility.toUpperCase()}`)
    return
  }

  const createChannelDto: CreateChannelDto = {
    userId: userId.value,
    name: name || '',
    password: password || '',
    channelVisibility: visibility.toUpperCase() as ChannelVisibilityType
  }

  if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
  else {
    socket.value.emit('createChannel', createChannelDto)
  } 
}

const showChannelManagerAndChat = ref(false)
const joinedChannelId = ref(0)
const showAvailableChannels = ref(false)
const showJoinedChannels = ref(false)

const addUsertoChannel = async() => {
	try {
	const response = await fetch('http://localhost:3000/api/channel/addUserToChannel',
	{
	method: 'PATCH',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		userId: userId.value,
		channelId: joinedChannelId.value
	})}, 
	)
	if (!response.ok) {
		throw new Error('Failed to add user to channel')
	}}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}
const removeUserFromChannel = async() => {
	try{	
	console.log(joinedChannelId.value)
		const response = await fetch('http://localhost:3000/api/channel/removeUserFromChannel',
	{
	method: 'Delete',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		userId: userId.value,
		channelId: joinedChannelId.value
	})},)
}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}



const openJoinChannels = () => {
  showAvailableChannels.value = true
}

const openMyChannels = () => {
  showJoinedChannels.value = true
}

const closeJoinChannels = async () => {
  showAvailableChannels.value = false
  return 
}

const closeMyChannels = async () => {
  showJoinedChannels.value = false
  return
}

const closeChannelManagerAndChat = () => {
  joinedChannelId.value = 0
  showChannelManagerAndChat.value = false
}

const goBack = () => {
  closeJoinChannels()
  closeMyChannels()
  closeChannelManagerAndChat()
}

const handleChannelEntered = async (channelId: number) => {
	joinedChannelId.value = channelId
	await updateChannelManager()
  await closeJoinChannels()
  await closeMyChannels()
  await addUsertoChannel().then(() => {
	  showChannelManagerAndChat.value = true
  })
}

const handleChannelLeft = () => {
  closeChannelManagerAndChat()
}

const hanndleChannelSignedout = () => {
  removeUserFromChannel()
  closeChannelManagerAndChat()
}

const updateChannelManager = async () => {
    if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
	try {
    socket.value.emit('SignInChannel', joinedChannelId.value);
	}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
};
</script>

<style>
.channels {
  height: calc(100% - 50px);
  padding: 1rem 0.5rem 0.5rem 0.5rem;
}
.channel-option-button {
  font-family: 'Courier New', Courier, monospace !important;
  display: block;
  width: calc(100%);
  margin: 0 0 0.5rem 0;
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

.back-button-container {
  text-align: right;
  height: 2.25rem;
}

.back-button {
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

.back-button:hover {
  color: aliceblue;
  border: 0.5px solid #ea9f42;
  text-shadow: 0px 0px 1px aliceblue;
}
</style>
