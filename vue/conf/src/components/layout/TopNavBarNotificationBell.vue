<template>
  <div>
    <RouterLink class="navButton header-username" to="/activity-center">
      <button class="settings-button" :class="'icon-wrapper'">
        <font-awesome-icon class="icon" icon="bell" title="Activity Center" />
        <span
          v-if="
            friendRequests?.length > 0 || matchInvites?.length > 0 || channelInvitations?.length > 0
          "
          class="notification-badge"
          >{{ channelInvitations?.length + friendRequests?.length + matchInvites?.length }}</span
        >
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Socket } from 'socket.io-client'
import { computed, ref, onMounted } from 'vue'
import type { MatchI } from '../../model/match/match.interface'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'
import { disconnectChatSocket, connectChatSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import { useFriendRequestStore } from '../../stores/friendRequests'
import { useMatchRequestsStore } from '../../stores/matchRequests'
import { useChannelInvitationsStore } from '../../stores/channelInvitations'
import type { ChannelInvitationI } from '../../model/channels/channelInvitation.interface'
import { useUserStore } from '../../stores/userInfo'
import router from '../../router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
const friendRequestsStore = useFriendRequestStore()
const friendRequests = computed(() => friendRequestsStore.friendRequests)

//const channelInvitationsStore = useChannelInvitationsStore()
//const channelInvitations = computed(() => channelInvitationsStore.channelInvitations)

const socket = ref<Socket | null>(null)
const matchInvites = ref<MatchI[]>([])
const matchRequestsStore = useMatchRequestsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const username = computed(() => userStore.username)
const userId = computed(() => userStore.userId)
const hasNotification = ref(false)
const channelInvitations = ref<ChannelInvitationI[]>([])

const initSocket = () => {
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

  setFriendRequestListener()
  setMatchInviteListener()
  setchannelInvitationListener()

  setFriendRequestData()
  setMatchInviteData()
  setChannelInvitationData()
})

const setMatchInviteListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('matchInvites', () => {
    setMatchInviteData()
  })
}

const setMatchInviteData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/matches/invites-by-userId?userId=${userId.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      matchInvites.value = responseData
      if (responseData && responseData.length > 0) {
        hasNotification.value = true
      }
      matchRequestsStore.setMatchRequests(matchInvites.value)
    } else {
      notificationStore.showNotification(
        'Error while fetching the match invites: ' + responseData.message,
        false
      )
    }
  } catch (error) {
    notificationStore.showNotification(
      'Something went wrong while fetching the match invites: ',
      false
    )
  }
}

const setFriendRequestData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friendships/get-friend-requests?userId=${userId.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      if (responseData && responseData.length > 0) {
        hasNotification.value = true
      }
      friendRequestsStore.addFriendRequest(responseData)
    } else {
      notificationStore.showNotification('Error while fetching the friend requests', false)
    }
  } catch (error: any) {
    notificationStore.showNotification(
      'Something went wrong while fetching the friend requests',
      false
    )
  }
}

const setFriendRequestListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('friendRequests', () => {
    setFriendRequestData()
  })
}

const setChannelInvitationData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-invitations/GetPendingInvitations?userId=${userId.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      if (responseData && responseData.length > 0) {
        hasNotification.value = true
      }
      channelInvitations.value = responseData
    } else {
      notificationStore.showNotification(
        'Error while fetching the channel invitations: ' + responseData.message,
        false
      )
    }
  } catch (error: any) {
    notificationStore.showNotification(
      'Something went wrong while fetching the channel invitations',
      false
    )
  }
}

const setchannelInvitationListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('NewChannelInvitation', (inviteeName: string) => {
	if (inviteeName === username.value) {
		notificationStore.showNotification('New Channel Invitation', true)
	}
	setChannelInvitationData()
  })

  socket.value.on('ChannelInvitationRejected', (channelName:string, inviteeName:string) => {
	notificationStore.showNotification(
      'Channel Invitaion for ' + channelName + ' from ' + inviteeName + 'rejected',
      true
    )
    setChannelInvitationData()
  })
  socket.value.on('ChannelInvitationAccepted', (channelName:string, inviteeName:string) => {
	notificationStore.showNotification('Invitaion for Channel: ' + channelName + ' accepted', true)
    setChannelInvitationData()
  })
}
</script>

<style>
.icon-wrapper {
  position: relative;
  display: inline-block;
}

.notification-badge {
  position: absolute;
  top: 0.15rem;
  right: -0.25rem;
  color: aliceblue;
  font-size: 0.5rem;
  padding: 0.1px 0.1px 0 0;
  background-color: red;
  border-radius: 5%;
}
</style>
