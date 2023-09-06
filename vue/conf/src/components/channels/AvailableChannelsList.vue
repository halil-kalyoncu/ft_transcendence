<template>
  <div class="available-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="channel in channelData" :key="channel.channel.id">
        <ChannelListItem
          :isPasswordProtected="channel.channel.protected"
          :channelName="channel.channel.name"
          :ownerName="channel.owner.username"
          :joinChannelButtonName="'Join'"
          :channelId="channel.channel.id"
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
import { onMounted, computed, ref } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import type { ChannelEntryI } from '../../model/channels/createChannel.interface'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'

const socket = ref<Socket | null>(null)
	const notificationStore = useNotificationStore()

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const emit = defineEmits(['channel-entered'])
const handleChannelEntered = (channelId: number) => {
  emit('channel-entered', channelId)
}

const channelData = ref<ChannelEntryI[]>([])
const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const setPublicChannels = async () => {
  const notificationStore = useNotificationStore()
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/getAllAvaiableChannels?userId=${userId.value}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    channelData.value = data
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
  }
}

const setChannelListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('ChannelDestroy', () => {
    console.log('ChannelDestroy fired from AvaibleChannelsList.vue')
    setPublicChannels()
    return
  })
  socket.value.on('channelCreated', () => {
    console.log('channelCreated fired from AvaibleChannelsList.vue')
    setPublicChannels()
    return
  })
}
onMounted(async () => {
	initSocket()
  await setPublicChannels()
  setChannelListener()
})
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
