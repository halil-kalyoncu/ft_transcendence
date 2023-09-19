<template>
  <div class="joinned-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="channel in channelData" :key="channel.channel.id">
        <ChannelListItem
          :isPasswordProtected="channel.channel.protected"
          :isPrivate="channel.channel.visibility === 'PRIVATE' ? true : false"
          :channelName="channel.channel.name"
          :ownerName="channel.owner.username"
          :joinChannelButtonNameProps="'Enter'"
          :channelId="channel.channel.id"
          :unreadMessageCount="unreadMessageCounts[channel.channel.id] || 0"
          :userId="userId"
          @channelEntered="handleChannelEntered(channel.channel.id)"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import ScrollViewer from '../utils/ScrollViewer.vue'
import ChannelListItem from './ChannelListItem.vue'
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import type { ChannelEntryI } from '../../model/channels/createChannel.interface'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const socket = ref<Socket | null>(null)
type UnreadMessageCounts = Record<number, number>
const unreadMessageCounts = ref<UnreadMessageCounts>({})
const bannedUsers = ref<Record<number, boolean>>({})

const notificationStore = useNotificationStore()
const channelData = ref<ChannelEntryI[]>([])
const unreadMessages = ref([])
const role = 'all'

const emit = defineEmits(['channel-entered'])
const handleChannelEntered = (channelId: number) => {
  emit('channel-entered', channelId)
}
const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const calculateUnreadMessages = async (channelId: number) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-message-read-status/getUnreadStatus?channelId=${channelId}&userId=${userId.value}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    unreadMessages.value = data
    return unreadMessages.value.length
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
    return 0
  }
}

const setChannels = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/getAllChannelsFromUser?userId=${userId.value}&role=${role}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    channelData.value = data
    return
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
    return
  }
}

const setUnreadMessages = async () => {
  try {
    for (const channel of channelData.value) {
      const count = await calculateUnreadMessages(channel.channel.id)
      const channelId = channel.channel.id
      unreadMessageCounts.value[channelId] = count
    }
    return
  } catch (error: any) {
    console.log('error: ' + error.message)
    notificationStore.showNotification(`Error` + error.message, true)
    return
  }
}
const setNewChannelMessageListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('newChannelMessage', () => {
    console.log('newChannelMessage fired from JoinedChannelsList.vue to update unread messages')
    setUnreadMessages()
    return
  })
  socket.value.on('ChannelDestroy', (channelName: string) => {
    console.log('ChannelDestroy fired from JoinedChannelsList.vue')
    setChannels()
    return
  })
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

  await setChannels()
  await setUnreadMessages()
  initSocket()
  setNewChannelMessageListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }
  socket.value.off('newChannelMessage')
  socket.value.off('ChannelDestroy')
})
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
