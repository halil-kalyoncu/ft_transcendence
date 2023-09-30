<template>
  <div class="channel-list-item">
    <div class="channel-owner-container" :title="`Joined at: ${date}`" @click="goToProfile">
      <font-awesome-icon class="icon" :icon="getRoleIcon(role)" />
      <p class="channel-owner">{{ username }}</p>
    </div>
    <Modal
      :isOpened="isModalOpened"
      :title="'Enter Mute duration in minutes'"
      :showVisibilitySelection="false"
      :isNumberSelection="true"
      @submit="handleConfirm"
      @close="handleClose"
    />
    <div class="actions">
      <template v-if="currentUserRole === 'owner' && role === 'member'">
        <button class="action-button-make-admin" @click="makeAdmin" title="Make Admin">
          <font-awesome-icon :icon="['fas', 'crown']" />
        </button>
      </template>
      <template
        v-if="
          (currentUserRole === 'owner' || currentUserRole === 'admin') &&
          role !== 'owner' &&
          requesterId !== targetUserId
        "
      >
        <button class="action-button-kick" @click="kickUser" title="Kick">
          <font-awesome-icon :icon="['fas', 'futbol']" />
        </button>
        <button
          class="action-button-ban"
          @click="banUnbanUser"
          :title="isUserBanned ? 'Unban' : 'Ban'"
        >
          <font-awesome-icon :icon="isUserBanned ? ['fas', 'ban'] : ['fas', 'check']" />
        </button>
        <button
          class="action-button-mute"
          @click="openModal"
          :title="isUserMuted ? 'Unmute' : 'Mute'"
          :class="isUserMuted ? 'disableMuteOption' : ''"
        >
          <font-awesome-icon :icon="isUserMuted ? ['fas', 'volume-mute'] : ['fas', 'volume-up']" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, ref, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'
import Modal from '../utils/Modal.vue'
import type { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import type { ErrorI } from '../../model/error.interface'

library.add(fas)
const router = useRouter()
const userStore = useUserStore()
const usernameUserStore = computed(() => userStore.username)
const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)
const minutesMuted = ref(0)
const maxValue = ref(100)

//get the props from parent
const props = defineProps({
  username: String,
  date: String,
  roleProp: String,
  currentUserRole: String,
  requesterId: Number,
  targetUserId: Number,
  channelId: Number,
  isUserBannedProp: Boolean,
  isUserMutedProp: Boolean
})

const role = ref(props.roleProp)
const isUserBanned = ref(props.isUserBannedProp)
const isUserMuted = ref(props.isUserMutedProp)

watchEffect(() => {
  role.value = props.roleProp
})

watchEffect(() => {
  isUserBanned.value = props.isUserBannedProp
})
watchEffect(() => {
  isUserMuted.value = props.isUserMutedProp
})

const goToProfile = () => {
  router.push(`/profile/${props.username}`)
}

const kickUser = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'kickChannelMember',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId
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

const banUnbanUser = async () => {
  if (isUserBanned.value) {
    unBanUser()
  } else {
    banUser()
  }
}

const unBanUser = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'unBanChannelMember',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId
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

const banUser = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'banChannelMember',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId
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

const makeAdmin = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'makeChannelAdmin',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId
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

const muteUser = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'muteChannelMember',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId,
        minutesToMute: minutesMuted.value
      },
      (response: ErrorI | any) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error, false)
          return
        } else {
          notificationStore.showNotification(
            props.username + ' was muted for ' + minutesMuted.value + ' minutes ',
            true
          )
          return
        }
      }
    )
  } catch (error) {
    notificationStore.showNotification(`Something went wrong`, false)
  }
}

const muteAUser = () => {
  if (minutesMuted.value === 0) {
    notificationStore.showNotification('Error: Minutes to be muted cannot be 0', false)
    return
  }

  try {
    muteUser()
    minutesMuted.value = 0
  } catch (error) {
    notificationStore.showNotification(`Something went wrong`, false)
  }
}

const unMuteUser = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  try {
    socket.value.emit(
      'unMuteChannelMember',
      {
        requesterId: props.requesterId,
        targetUserId: props.targetUserId,
        channelId: props.channelId
      },
      (response: ErrorI | any) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error, false)
          return
        } else {
          return
        }
      }
    )
  } catch (error) {
    notificationStore.showNotification(`Something went wrong`, false)
  }
}

const getRoleIcon = (role: string | undefined) => {
  switch (role) {
    case 'admin':
      return ['fas', 'crown']
    case 'member':
      return ['fas', 'user']
    case 'owner':
      return ['fas', 'star']
    default:
      return ['fas', 'question']
  }
}

interface ModalResult {
  name?: string
  password?: string
  visibility?: string
  minutesOfMute?: number
}

const isModalOpened = ref(false)
const openModal = async () => {
  if (isUserMuted.value === true) {
    await unMuteUser()
    return
  }
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleConfirm = ({ name, password, visibility, minutesOfMute }: ModalResult) => {
  isModalOpened.value = false

  minutesMuted.value = minutesOfMute !== undefined ? minutesOfMute : 0
  muteAUser()
}

const initSocket = async () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
  return
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

  await initSocket()
})
</script>

<style>
.channel-owner-container {
  cursor: pointer;
}

.channel-list-item {
  cursor: auto !important;
}

.username,
.date {
  margin-right: 10px;
}

.actions {
  display: flex;
}

.action-button-kick,
.action-button-ban,
.action-button-mute,
.action-button-make-admin {
  background: none;
  border: none;
  cursor: pointer;
  color: #e47264;
}

.password-input {
  display: block;
  max-width: 2.5rem;
  margin: 0 0 0 0.5rem;
}

.action-button-ban {
  color: #a83232;
}
.action-button-kick {
  color: white;
}

.action-button-mute {
  color: green;
}

.disableMuteOption {
  color: #a83232 !important;
  cursor: auto;
}

.action-button-make-admin {
  color: gold;
}

.max-width-helper {
  width: 50px;
}
</style>
