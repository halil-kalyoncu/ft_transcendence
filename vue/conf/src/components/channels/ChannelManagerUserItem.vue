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
        v-if="(currentUserRole === 'owner' || currentUserRole === 'admin') && (role !== 'owner') && (requesterId !== targetUserId)"
      >
        <button class="action-button-kick" @click="kickUser" title="Kick">
          <font-awesome-icon :icon="['fas', 'futbol']" />
        </button>
        <button class="action-button-ban" 
		@click="banUnbanUser" 
		:title="banTitle"
		:class="isUserBanned ? 'Unban' : 'Ban'"
		>
          <font-awesome-icon :icon=" isUserBanned ? ['fas', 'ban'] : ['fas', 'check']" />
        </button>
        <button
          class="action-button-mute"
          @click="openModal"
          :title="muteTitle"
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
import { ref, watch, watchEffect, onMounted } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'
import Modal from '../utils/Modal.vue'
import type { Socket } from 'socket.io-client'
import { connectWebSocket } from '../../websocket'


library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()
const socket = ref <Socket | null >(null)
const minutesMuted = ref(0)
const maxValue = ref(100)
const isUserMuted = ref(false)
const muteTitle = ref('Mute')
const banTitle = ref('Ban')

//get the props from parent
const props = defineProps({
  username: String,
  date: String,
  roleProp: String,
  currentUserRole: String,
  requesterId: Number,
  targetUserId: Number,
  channelId: Number,
  isUserBannedProp: Boolean
})
// const emit = defineEmits(['changedProperties']);

// const emitChanges = () => {
//   emit('changedProperties')
// }

const role = ref(props.roleProp)
const isUserBanned = ref(props.isUserBannedProp)

watchEffect(() => {
  role.value = props.roleProp
})

const goToProfile = () => {
  router.push(`/profile/${props.username}`)
}

const kickUser = async () => {
	if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
	try {
    socket.value.emit('kickChannelMember', {
		requesterId: props.requesterId,
		targetUserId: props.targetUserId,
		channelId: props.channelId
	});
	}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}

const banUnbanUser = async () => {
	if (isUserBanned.value){
		unBanUser()
	}
	else {
		banUser()
	}
}

const unBanUser = async () => {
	if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
	try {
    socket.value.emit('unBanChannelMember', {
		requesterId: props.requesterId,
		targetUserId: props.targetUserId,
		channelId: props.channelId
	});
	}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}

const banUser = async () => {
	if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
	try {
    socket.value.emit('banChannelMember', {
		requesterId: props.requesterId,
		targetUserId: props.targetUserId,
		channelId: props.channelId
	});
	}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}

const makeAdmin = async () => {
	if (!socket || !socket.value) {
      notificationStore.showNotification('Error: Connection problems', true);
      return;
    }
	try {
    socket.value.emit('makeChannelAdmin', {
		requesterId: props.requesterId,
		targetUserId: props.targetUserId,
		channelId: props.channelId
	});
	}
	catch (error: any) {
		notificationStore.showNotification(`Error` + error.message, true)
	}
}


const muteUser = () => {
  if (minutesMuted.value === 0) {
    notificationStore.showNotification('Error: Minutes to be muted cannot be 0', false)
    return
  }

  let muted = true

  if (muted) {
    notificationStore.showNotification(
      props.username + ' was muted for ' + minutesMuted.value + ' minutes ',
      true
    )
    isUserMuted.value = true
    muteTitle.value = 'User is muted'
  }
  minutesMuted.value = 0
}

const unmuteUser = () => {
  isUserMuted.value = false
  muteTitle.value = 'Mute'
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
const openModal = () => {
  if (isUserMuted.value === true) {
    unmuteUser()
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
  muteUser()
}

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}


onMounted( () => {
	initSocket();
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
