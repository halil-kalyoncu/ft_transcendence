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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { connectChatSocket } from '../../websocket'
import type { ChannelMessageI } from '../../model/channels/channelMessage.interface'
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
    setNewChannelMessages()
  })
  socket.value.on(
    'memberKicked',
    (kickedMemberName: string, kickChannelId: number, kickChannelName: string) => {
      setNewChannelMessages()
    }
  )
}

const setUserChangesListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('UserSignedOut', (userSignedoutname: string, leftChannelId: number) => {
    setNewChannelMessages()
  })
}

const setNewChannelMessages = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/channel-message/getChannelMessagesforChannel?channelId=${channelId}&userId=${
        userId.value
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame')}`
        }
      }
    )
    const responseData = await response.json()
    if (!response.ok) {
      notificationStore.showNotification(responseData.message, false)
      return
    }
    channelMessages.value = responseData
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
    return
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
  setNewChannelMessages()
  setNewChannelMessageListener()
  setUserChangesListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }

  socket.value.off('MemberKicked')
  socket.value.off('newChannelMessage')
  socket.value.off('UserSignedOut')
})

const sendChannelMessage = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  try {
    if (newchannelMessages.value.trim() === '') {
      return
    }

    socket.value.emit(
      'sendChannelMessage',
      {
        senderId: loggedUser.value.id,
        channelId: channelId,
        message: newchannelMessages.value
      },
      (response: any | ErrorI) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error, false)
          return
        } else {
          return
        }
      }
    )
    newchannelMessages.value = ''
    return
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
    return
  }
}

const updateMutedUsers = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/channel/updateMutedUsers?channelId=${channelId}`,
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
    return responseData
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
  }
}

const checkForMutedUsers = async () => {
  const membersToUnmute = await updateMutedUsers()

  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  if (membersToUnmute.length > 0) {
    socket.value.emit('sendUpdateUnMuted', membersToUnmute, (response: any | ErrorI) => {
      if ('error' in response) {
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
