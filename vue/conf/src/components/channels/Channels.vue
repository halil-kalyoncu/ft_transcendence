<template>
  <section class="channels">
    <template v-if="!showAvailableChannels && !showJoinedChannels && !showChannelManagerAndChat">
      <div class="channel-option-button-container">
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
      </div>
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
      <div v-if="showChannelManagerAndChat" class="channel-outer-container">
        <ChannelManager
          :channelId="joinedChannelId"
          @channel-left="handleChannelLeft"
          @channel-signedout="hanndleChannelSignedout"
          @channel-force-leave="hanndleChannelforceLeave"
        />
        <ChannelMessages :channelId="joinedChannelId" />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import ChannelManager from './ChannelManager.vue'
import ChannelMessages from '../chat/ChannelMessages.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onBeforeUnmount, onMounted, computed, watch, ref } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import { connectChatSocket, disconnectChatSocket } from '../../websocket'
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
import type { ErrorI } from '../../model/error.interface'

const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)

const initSocket = async () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
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
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
  }
})

const userStore = useUserStore()
const username = computed(() => userStore.username)
const userId = computed(() => userStore.userId)

interface ModalResult {
  name?: string
  password?: string
  channelVisibility?: string
  minutesOfMute?: number
  passwordSet?: boolean
}

const isModalOpened = ref(false)
const openModal = () => {
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleConfirm = async ({
  name,
  password,
  channelVisibility,
  minutesOfMute,
  passwordSet
}: ModalResult) => {
  isModalOpened.value = false
  if (channelVisibility === undefined) {
    channelVisibility = ChannelVisibility.PUBLIC
  }
  if (
    !Object.values(ChannelVisibility).includes(
      channelVisibility.toUpperCase() as ChannelVisibilityType
    )
  ) {
    console.error(`Invalid channel visibility:: ${channelVisibility.toUpperCase()}`)
    return
  }
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems')
    return
  }
  if (passwordSet === true) {
    const createChannelDto: CreateChannelDto = {
      userId: userId.value,
      name: name || '',
      password: password || '',
      channelVisibility: channelVisibility.toUpperCase() as ChannelVisibilityType
    }
    await socket.value.emit(
      'createProtectedChannel',
      createChannelDto,
      (response: ErrorI | any) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error)
          return
        } else {
          notificationStore.showNotification('Channel created', true)
          return
        }
      }
    )
  } else {
    const createChannelDto: CreateChannelDto = {
      userId: userId.value,
      name: name || '',
      channelVisibility: channelVisibility.toUpperCase() as ChannelVisibilityType
    }
    await socket.value.emit(
      'createUnProtectedChannel',
      createChannelDto,
      (response: ErrorI | any) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error)
          return
        } else {
          notificationStore.showNotification('Channel created', true)
          return
        }
      }
    )
  }
}

const showChannelManagerAndChat = ref(false)
const joinedChannelId = ref(0)
const showAvailableChannels = ref(false)
const showJoinedChannels = ref(false)

const addUsertoChannel = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/channel/addUserToChannel`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        },
        body: JSON.stringify({
          userId: userId.value,
          channelId: joinedChannelId.value
        })
      }
    )
    const responseData = await response.json()
    if (!response.ok) {
      notificationStore.showNotification(responseData.message, false)
      return
    }
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
  }
}

const MarkMessagesAsRead = async () => {
  if (joinedChannelId.value !== 0) {
    console.log('call mark messages')
    try {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:${
          import.meta.env.VITE_BACKENDPORT
        }/api/channel-message/markChannelMessagesAsRead?channelId=${joinedChannelId.value}&userId=${
          userId.value
        }`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
          }
        }
      )
      const responseData = await response.json()
      if (!response.ok) {
        notificationStore.showNotification(responseData.message, false)
        return
      }
    } catch (error) {
      notificationStore.showNotification('Something went Wrong', false)
    }
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

const closeChannelManagerAndChat = async () => {
  joinedChannelId.value = 0
  showChannelManagerAndChat.value = false
  return
}

const goBack = async () => {
  await MarkMessagesAsRead()
  closeJoinChannels()
  closeMyChannels()
  closeChannelManagerAndChat()
}

const handleChannelEntered = async (channelId: number) => {
  joinedChannelId.value = channelId
  await closeJoinChannels()
  await closeMyChannels()
  await addUsertoChannel().then(() => {
    showChannelManagerAndChat.value = true
  })
  await updateChannelManager()
}

const handleChannelLeft = async () => {
  await MarkMessagesAsRead()
  await closeChannelManagerAndChat()
}
const hanndleChannelforceLeave = async () => {
  await closeChannelManagerAndChat()
}

const hanndleChannelSignedout = async () => {
  await closeChannelManagerAndChat()
}

// ERROR HANDLING GATEWAY FRONTEND
const updateChannelManager = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems')
    return
  }
  try {
    socket.value.emit(
      'SignInChannel',
      {
        channelId: joinedChannelId.value,
        username: username.value
      },
      (response: ErrorI | any) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error, false)
          return
        }
      }
    )
  } catch (error) {
    notificationStore.showNotification(`Something went wrong`, false)
  }
}
</script>

<style>
.channels {
  height: calc(100% - 50px);
  padding: 1rem 0.5rem 0 0.5rem;
  position: relative;
}

.channel-option-button-container {
  height: 100%;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  justify-content: flex-end;
}

.channels .channel-option-button {
  font-family: 'Courier New', Courier, monospace !important;
  display: block;
  width: calc(100%);
  background: transparent;
  margin: 0 0 0.5rem 0;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.25s color ease-out, border 0.25s ease-out;
}

.channels .channel-option-button:last-child {
  margin: 0 0 1rem 0;
}

.channels .channel-option-button:hover {
  color: aliceblue;
  border: 0.5px solid #ea9f42;
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

.channel-outer-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
}
</style>
