<template>
  <h2 class="current-channel-name">{{ ChannelName }}</h2>

  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
    <div v-for="member in Members" :key="member.userId">
      <ChannelManagerUserItem
        :username="member.username"
        :date="member.statusSince"
        :roleProp="member.role.toLowerCase()"
        :currentUserRole="currentUserRole.toLowerCase()"
      />
    </div>
  </ScrollViewer>
  <div class="channel-manager-info">
    <div class="change-password-container">
      <button
        v-show="currentUserRole === ChannelMemberRole.OWNER"
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
  </div>
</template>

<script setup lang="ts">
//TODO: Need joined at or do we just say the role time
import { computed, ref, onMounted } from 'vue'
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectWebSocket } from '../../websocket'
import type { ChannelManagerMemberI } from '../../model/channels/channelMessage.interface'
import type { ChannelMemberRoleType } from '../../model/channels/createChannel.interface'
import  { ChannelMemberRole } from '../../model/channels/createChannel.interface'
const props = defineProps({
  channelId: Number
})

const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed(() => userStore.username)
const channelId: Number | undefined = props.channelId
const Members = ref<ChannelManagerMemberI[]>([])
let currentUserRole = ref<ChannelMemberRoleType>(ChannelMemberRole.MEMBER)
let ChannelName = ref<string>('')
const emit = defineEmits(['channel-left', 'channel-signedout'])


const showPasswordField = ref(false)
const password = ref('')

const modalVisible = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');



onMounted(() => {

	initSocket()
     setMembers().then(() => {
	 	setCurrentUserRole()
     	setChannelName()})
	getSignOutButtonText()
	setDestroyChannelListener()
	setUserSignedListener()
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const setMembers = async () => {
	try{
		const response = await fetch (
			`http://localhost:3000/api/channel/getAllChannelManagerMembers?channelId=${channelId}`
			)
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}
		const data = response.json()
		Members.value = await data
	}
	catch (error: any)
	{
		console.error("Error: ", error)
	}
}
const setCurrentUserRole = () => {
for (const member of Members.value)
	if(member.userId === userId.value)
		currentUserRole.value = member.role
};

const setChannelName = () => {
	ChannelName.value = Members.value[0].channelName
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
const setUserSignedListener = () => {
	if(!socket || !socket.value) {
		notificationStore.showNotification('Error: Connection problems', true)
		return
	}
	socket.value.on('UserSignedOut', (channelId: Number) => {
		console.log('UserSignedOut fired')
		notificationStore.showNotification(' Signed out Channel', true)
		setMembers().then(() => {
			setCurrentUserRole()
		})
	})
	socket.value.on('UserSignedIn', (channelId: Number) => {
		console.log('UserSignedIn fired')
		notificationStore.showNotification(' Signed in Channel', true)
		setMembers().then(() => {
			setCurrentUserRole()
		})
	})
}
const getSignOutButtonText = () => {
  if (currentUserRole.value === ChannelMemberRole.OWNER) {
	return 'Destroy'
  } else {
	return 'Sign Out'
  }
}

const handleSignOut = () => {
  if (currentUserRole.value === ChannelMemberRole.OWNER) {
	DestroyChannel();
  } else {
	SignOutChannel();
  }
}

const leaveChannel = () => {
  notificationStore.showNotification('You have left the channel: ' + ChannelName, true)
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
  notificationStore.showNotification('You have signed out the channel: ' + ChannelName, true)
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('SignOutChannel', {
	  channelId: channelId,
	  senderId: userId.value
  })
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



/* const showSignOutConfirmation = () => {
  modalTitle.value = 'Confirmation';
  modalMessage.value = currentUserRolelower === 'owner'
    ? 'Are you sure you want to destroy the channel?'
    : 'Are you sure you want to sign out from the channel?';

  modalVisible.value = true;
};
 */
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
