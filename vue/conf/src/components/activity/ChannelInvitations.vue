<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-for="invitation in channelInvitations" :key="invitation.invitationId">
        <ChannelInvitationsItem
          :username="invitation.inviterName"
          :channelName="invitation.channelName"
          :isPasswordProtected="invitation.isPasswordProtected"
          :invitationId="invitation.invitationId"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Socket } from 'socket.io-client'
import { connectWebSocket } from '../../websocket'
import type { ChannelInvitationI } from '../../model/channels/channelInvitation.interface'
import type { ChannelMemberRoleType } from '../../model/channels/createChannel.interface'
import { ChannelMemberRole } from '../../model/channels/createChannel.interface'
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

onMounted(() => {
  initSocket()
  setChannelInvitations()
  setInvitationListener()
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const setChannelInvitations = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-invitations/GetPendingInvitations?userId=${userId.value}`
    )
    if (!response.ok) {
      throw new Error('Could not fetch channel manager members')
    }
    const data = response.json()
    channelInvitations.value = await data
  } catch (error: any) {
    console.error('Error: ', error)
  }
}

const setInvitationListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('NewChannelInvitation', () => {
    console.log('newChannelInvitation fired from ChannelsInvitations.vue')
    setChannelInvitations()
  })
  socket.value.on('ChannelInvitationAccepted', (channelName, UserName) => {
    console.log('User Accepted ChannelInvitaion fired')
    notificationStore.showNotification('Channel Invitaion accepted', true)
    setChannelInvitations()
  })
  socket.value.on('ChannelInvitationRejected', (channelName, UserName) => {
    console.log('User Rejected ChannelInvitaion fired')
    notificationStore.showNotification(
      'Channel Invitaion for ' + channelName + ' from ' + UserName + 'rejected',
      true
    )
    setChannelInvitations()
  })
}
</script>

<style></style>
