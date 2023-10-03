<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="channelInvitations && channelInvitations.length">
        <div v-for="invitation in channelInvitations" :key="invitation.invitationId">
          <ChannelInvitationsItem
            :username="invitation.inviterName"
            :inviterId="invitation.inviterUserId"
            :channelName="invitation.channelName"
            :isPasswordProtected="invitation.isPasswordProtected"
            :isPrivate="invitation.ChannelVisibility === 'PRIVATE' ? true : false"
            :invitationId="invitation.invitationId"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">No Pending Channel Invitations</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import type { ChannelInvitationI } from '../../model/channels/channelInvitation.interface'
import ChannelInvitationsItem from './ChannelInvitationsItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'

const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const username = computed(() => userStore.username)
const userId = computed<number>(() => userStore.userId)
const channelInvitations = ref<ChannelInvitationI[]>([])

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
  setChannelInvitations()
  setInvitationListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }
  socket.value.off('NewChannelInvitation')
  socket.value.off('ChannelInvitationAccepted')
  socket.value.off('ChannelInvitationRejected')
  socket.value.off('InvitationObsolete')
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const setChannelInvitations = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/channel-invitations/GetPendingInvitations?userId=${userId.value}`,
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
    }
    channelInvitations.value = await responseData
  } catch (error) {
    notificationStore.showNotification('Something went wrong', false)
  }
}

const setInvitationListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('NewChannelInvitation', (inviteeName: string) => {
    if (inviteeName !== username.value) {
      return
    }
    notificationStore.showNotification('New Channel Invitation', true)
    console.log('newChannelInvitation fired from ChannelsInvitations.vue')
    setChannelInvitations()
  })
  socket.value.on('ChannelInvitationAccepted', (channelName: string, UserName: string) => {
    if (UserName !== username.value) {
      return
    }
    console.log('User Accepted ChannelInvitaion fired')
    setChannelInvitations()
  })
  socket.value.on('ChannelInvitationRejected', (channelName: string, UserName: string) => {
    if (UserName !== username.value) {
      return
    }
    console.log('User Rejected ChannelInvitaion fired')
    setChannelInvitations()
  })

  socket.value.on('InvitationObsolete', (UserName: string, channelId: number) => {
    if (UserName !== username.value) {
      return
    }
    console.log('InvitationObsolete from ChannelInvitations.vue fired')
    notificationStore.showNotification('User Signed In', true)
    setChannelInvitations()
  })
}
</script>

<style></style>
