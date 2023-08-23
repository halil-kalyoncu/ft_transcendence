<template>
  <h2 class="current-channel-name">{{ tempChannelName }}</h2>

  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
    <div v-for="(user, index) in dummyUserData" :key="index">
      <ChannelManagerUserItem
        :username="user.username"
        :date="user.date"
        :roleProp="user.role"
        :currentUserRole="currentUserRole"
      />
    </div>
  </ScrollViewer>
  <div class="channel-manager-info">
    <div class="change-password-container">
      <button
        v-show="currentUserRole === 'owner'"
        class="join-channel-button"
        @click="changePassword"
      >
        Change Password
      </button>
      <input
        v-if="showPasswordField"
        v-model="password"
        placeholder="Enter password"
        type="password"
        class="password-input"
      />
    </div>

    <button :class="['join-channel-button', 'leave-channel-button']" @click="leaveChannel">
      Leave
    </button>
	<button :class="['join-channel-button', 'signout-channel-button']" @click="handleSignOut">
      {{ getSignOutButtonText() }}
    
	  </button>
	
		<!-- WITH CONFRIMATION BUTTON CALL "showSignOutConfirmation"
	<ConfirmationModal
    v-model:visible="modalVisible"
    :title="modalTitle"
    :message="modalMessage"
    @confirmed="handleSignOut"
    @cancelled="modalVisible = false"
  />  -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectWebSocket } from '../../websocket'

const props = defineProps({
  channelId: Number
})

const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed(() => userStore.username)
const channelId: Number = props.channelId

type User = {
  username: string
  date: string
  role: string
}

const roles = ['owner', 'admin', 'member']
const showPasswordField = ref(false)
const password = ref('')

const modalVisible = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const showSignOutConfirmation = () => {
  modalTitle.value = 'Confirmation';
  modalMessage.value = currentUserRole === 'owner'
    ? 'Are you sure you want to destroy the channel?'
    : 'Are you sure you want to sign out from the channel?';

  modalVisible.value = true;
};

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const setDestroyChannelListener = () => {
	if(!socket || !socket.value) {
		notificationStore.showNotification('Error: Connection problems', true)
		return
	}
	socket.value.on('ChannelDestroy', (channelId: Number) => {
		console.log('ChannelDestroy fired')
		notificationStore.showNotification('Channel has been destroyed', true)
		emit('channel-left')
	})
}

const getSignOutButtonText = () => {
  if (currentUserRole === 'owner') {
	return 'Destroy'
  } else {
	return 'Sign Out'
  }
}


const currentUserRole = 'owner'

const handleSignOut = () => {
  if (currentUserRole === 'owner') {
	DestroyChannel();
  } else {
	SignOutChannel();
  }
}

let tempChannelName = 'Computato Potato'
const emit = defineEmits(['channel-left', 'channel-signedout'])

const leaveChannel = () => {
  notificationStore.showNotification('You have left the channel: ' + tempChannelName, true)
  emit('channel-left')
}

const DestroyChannel = () => {
	if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('DestroyChannel', {
	  channelId: channelId,
	  senderId: userId.value
  })
}

const SignOutChannel = () => {
  notificationStore.showNotification('You have signed out the channel: ' + tempChannelName, true)
  emit('channel-signedout')
}

const changePassword = () => {
  if (!showPasswordField.value) {
    showPasswordField.value = true
  } else {
    //todo: fix notification to not share password
    notificationStore.showNotification(
      'Password has been successfully changed to: ' + password.value,
      true
    )
    showPasswordField.value = false
  }
}
const getRandomRole = () => roles[Math.floor(Math.random() * roles.length)]

const dummyUserData: User[] = Array.from({ length: 10 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  date: `2023-07-21`,
  role: getRandomRole()
}))

onMounted(() => {
	const currentUser = computed(() => dummyUserData.find((user) => user.username === username.value))
// todo: compute currentUserRole instead of static when backend is in place
// const currentUserRole = computed(() => currentUser.value ? currentUser.value.role : 'member');
	initSocket()
	setDestroyChannelListener()
})
//TODO: 1 Define on mounte, init Socket, Define the people int he channel etc, setChannellistener for channel destoyed (later for member left etc.)
</script>


<style>
/* TODO: distribution of buttons */

.current-channel-name {
  text-align: center;
  font-size: 1.25rem;
  margin: -1rem 0 0 0;
  font-family: 'Courier New', Courier, monospace !important;
  color: #ea9f42;
}

.channel-manager-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-start;
  margin: 0.25rem 0 0 0;
  min-height: 2.75rem;
}

.channel-manager-info .join-channel-button {
  width: 100%;
  min-width: none;
  max-width: none;
  background-color: #32a852;
  border: none;
  transition: background-color 0.25s ease-out;
}

.channel-manager-info .join-channel-button:hover {
  border: none;
}

.channel-manager-info .leave-channel-button {
  background-color: #f64456;
}

.channel-manager-info .signout-channel-button {
  background-color: #110442;
}
.channel-manager-info .password-input {
  margin: 0;
  width: 100%;
}

.change-password-container {
  width: 100%;
  margin: -1.25px 0 0 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
