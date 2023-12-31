<template>
  <div class="available-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-if="channelData && channelData.length">
        <div v-for="channel in channelData" :key="channel.channel.id">
          <ChannelListItem
            :isPasswordProtected="channel.channel.protected"
            :isPrivate="false"
            :channelName="channel.channel.name"
            :ownerName="channel.owner.username"
            :joinChannelButtonNameProps="'Join'"
            :channelId="channel.channel.id"
            @channelEntered="handleChannelEntered(channel.channel.id)"
          />
        </div>
      </div>
      <div v-else-if="showEmptyListNotification">
        <p class="friends-empty-notification">Channel list is empty</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import ScrollViewer from '../utils/ScrollViewer.vue'
import ChannelListItem from './ChannelListItem.vue'
import { onMounted, computed, ref, onBeforeUnmount } from 'vue'
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
const showEmptyListNotification = ref(false)

const setPublicChannels = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/channel/getAllAvaiableChannels?userId=${userId.value}`,
      {
        method: 'GET',
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

    channelData.value = await responseData
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
    return
  }
}

const setChannelListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('ChannelDestroy', (channelName: string) => {
    setPublicChannels()
    return
  })
  socket.value.on('channelCreated', () => {
    setPublicChannels()
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
  initSocket()
  await setPublicChannels()
  setChannelListener()
  setTimeout(() => {
    showEmptyListNotification.value = true
  }, 5)
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }

  socket.value.off('ChannelDestroy')
  socket.value.off('channelCreated')
})
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
