<template>
  <h2 class="current-channel-name">{{ ChannelName }}</h2>
  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
    <InvitePrivateChannelModal
      v-if="isModalOpened"
      :isOpened="isModalOpened"
      :title="modalTitle"
      :channelId="channelId"
      @submit="handleSubmit"
      @close="handleClose"
    />
    <div
      v-for="memberItem in memberItems"
      :key="`${memberItem.isUserBannedProp}-${memberItem.isUserMutedProp}`"
    >
      <ChannelManagerUserItem
        :username="memberItem.username"
        :date="memberItem.date"
        :roleProp="memberItem.roleProp"
        :currentUserRole="memberItem.currentUserRole"
        :requesterId="memberItem.requesterId"
        :targetUserId="memberItem.targetUserId"
        :channelId="memberItem.channelId"
        :isUserBannedProp="memberItem.isUserBannedProp"
        :isUserMutedProp="memberItem.isUserMutedProp"
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
        {{ showPasswordField ? 'Confirm' : 'Change Password' }}
      </button>
      <input
        v-if="showPasswordField"
        v-model="password"
        placeholder="Enter password"
        type="password"
        class="password-input"
      />
    </div>

    <button :class="['join-channel-button', 'leave-channel-button']" @click="handleLeaveChannel">
      Leave
    </button>
    <div class="destroy-container">
      <button :class="['join-channel-button', 'signout-channel-button']" @click="handleSignOut">
        {{ getSignOutButtonText() }}
      </button>
      <input
        v-if="showConfirmDestroyField"
        v-model="confirmDestroy"
        placeholder="Confirm with 'OK'"
        class="password-input"
      />
    </div>
    <button
      v-show="
        currentUserRole === ChannelMemberRole.OWNER || currentUserRole === ChannelMemberRole.ADMIN
      "
      :class="['join-channel-button', 'add-user-button']"
      @click="openAddModal"
    >
      Add User
    </button>
  </div>
</template>

<script setup lang="ts">
//TODO: Need joined at or do we just say the role time
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import type { ChannelManagerMemberI } from '../../model/channels/channelMessage.interface'
import type { ChannelMemberRoleType } from '../../model/channels/createChannel.interface'
import { ChannelMemberRole } from '../../model/channels/createChannel.interface'
import InvitePrivateChannelModal from './InvitePrivateChannelModal.vue'
import type { ErrorI } from '../../model/error.interface'
const props = defineProps({
  channelId: {
    type: Number,
    required: true
  }
})

const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed(() => userStore.username)
const channelId: number = props.channelId
const Members = ref<ChannelManagerMemberI[]>([])
let currentUserRole = ref<ChannelMemberRoleType>(ChannelMemberRole.MEMBER)
let ChannelName = ref<string>('')
const emit = defineEmits(['channel-left', 'channel-signedout', 'channel-force-leave'])

const showPasswordField = ref(false)
const showConfirmDestroyField = ref(false)
const password = ref('')
const confirmDestroy = ref('')

const modalTitle = ref('')
const isModalOpened = ref(false)

const memberItems = computed(() => {
  return Members.value.map((member) => {
    return {
      username: member.username,
      date: member.statusSince,
      roleProp: member.role.toLowerCase(),
      currentUserRole: currentUserRole.value.toLowerCase(),
      requesterId: userId.value,
      targetUserId: member.userId,
      channelId: channelId,
      isUserBannedProp: member.banned,
      isUserMutedProp: isUserMuted(member.unmuteAt)
    }
  })
})

const isUserMuted = (memberUnmuteAt: string | null) => {
  if (memberUnmuteAt == null) {
    return false
  }
  const unmuteAt = new Date(memberUnmuteAt)
  const now = new Date()
  return unmuteAt > now
}

const getMembers = async () => {
  await setMembers().then(() => {
    setCurrentUserRole()
    setChannelName()
  })
  return
}

onMounted(async () => {
  initSocket()
  await getMembers()
  getSignOutButtonText()
  await setDestroyChannelListener()
  setUserSignedListener()
})

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }
  socket.value.off('ChannelDestroy')
  socket.value.off('UserSignedOut')
  socket.value.off('UserSignedIn')
  socket.value.off('ChannelInvitationAccepted')
  socket.value.off('madeAdmin')
  socket.value.off('memberKicked')
  socket.value.off('memberBanned')
  socket.value.off('memberUnBanned')
  socket.value.off('memberMuted')
  socket.value.off('memberUnMuted')
  socket.value.off('passwordSet')
})
const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const setMembers = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/getAllChannelManagerMembers?channelId=${channelId}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    Members.value = await data
  } catch (error: any) {
    console.error('Error: ', error)
  }
}

const setCurrentUserRole = () => {
  for (const member of Members.value)
    if (member.userId === userId.value) currentUserRole.value = member.role
}

const setChannelName = () => {
  ChannelName.value = Members.value[0].channelName
}

const setDestroyChannelListener = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('ChannelDestroy', (channelId: number) => {
    notificationStore.showNotification(ChannelName.value + ' has been destroyed', false)
    emit('channel-force-leave')
  })
}
// TODO: CHECK FOR NOTIFICATIONS HERE!
const setUserSignedListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('UserSignedOut', async (userSignedOutName: string, channelIdSignOut: number) => {
    console.log('UserSignedOut from ChannelManager fired')
    if (channelIdSignOut === channelId) {
      notificationStore.showNotification(userSignedOutName + ' signed out Channel', true)
    }
    await setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('UserSignedIn', (userSignedInName: string, channelSignIn: number) => {
    console.log('UserSignedIn fired')
    if (channelSignIn === channelId) {
      notificationStore.showNotification(userSignedInName + ' signed in Channel', true)
    }
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('ChannelInvitationAccepted', (channelId: Number) => {
    console.log('ChannelInvitationAccepted fired')
    //notificationStore.showNotification(' Signed in Channel', true)
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('madeAdmin', (username: string) => {
    console.log('madeAdmin fired')
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('memberKicked', (response: String | ErrorI) => {
    console.log('memberKicked fired')
    if (response === username.value) {
      emit('channel-force-leave')
    }
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('memberBanned', (membership: any) => {
    console.log('memberBanned fired')
    //await notificationStore.showNotification('User Banned', true)
    if (membership.userId === userId.value) {
      emit('channel-force-leave')
    }
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('memberUnBanned', (membership: any) => {
    console.log('memberUnBanned fired')
    //await notificationStore.showNotification('User UnBanned', true)
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('memberMuted', (user: string, timeMuted: number) => {
    console.log('memberMuted fired')
    if (user === username.value) {
      notificationStore.showNotification(
        'You have been muted for ' + timeMuted.toString() + ' min.',
        true
      )
    } else {
      notificationStore.showNotification(
        user + ' muted for ' + timeMuted.toString() + ' min.',
        true
      )
    }
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('memberUnMuted', (user: string) => {
    console.log('memberUnMuted fired')
    if (user === username.value) {
      notificationStore.showNotification('You have been unmuted', true)
    } else {
      notificationStore.showNotification(user + ' unmuted', true)
    }
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
  socket.value.on('passwordSet', (channelName: string) => {
    console.log('passwordSet fired')
    notificationStore.showNotification(channelName + ' has new password')
    setMembers().then(() => {
      setCurrentUserRole()
    })
  })
}

const getSignOutButtonText = () => {
  if (currentUserRole.value === ChannelMemberRole.OWNER) {
    if (showConfirmDestroyField.value) return 'Confirm'
    return 'Destroy'
  } else {
    return 'Sign Out'
  }
}

const handleSignOut = () => {
  if (currentUserRole.value === ChannelMemberRole.OWNER) {
    DestroyChannel()
  } else {
    SignOutChannel()
  }
}

const openAddModal = () => {
  modalTitle.value = 'Invite Users to Channel'
  isModalOpened.value = true
}

const handleSubmit = () => {
  isModalOpened.value = false
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleLeaveChannel = () => {
  emit('channel-left')
}

const destroyChannel = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  await socket.value.emit('DestroyChannel', {
    channelId: channelId,
    senderId: userId.value
  })
}

const DestroyChannel = async () => {
  if (!showConfirmDestroyField.value) {
    showConfirmDestroyField.value = true
  } else {
    if (confirmDestroy.value === 'OK') {
      await destroyChannel()
    } else {
      notificationStore.showNotification('Wrong confirmation')
    }
    confirmDestroy.value = ''
    showConfirmDestroyField.value = false
  }
}

const SignOutChannel = async () => {
  notificationStore.showNotification('You have signed out the channel: ' + ChannelName.value, true)
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  emit('channel-signedout')
}

const setPassword = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  await socket.value.emit(
    'setChannelPassword',
    {
      channelId: channelId,
      userId: userId.value,
      password: password.value
    },
    async (response: any | ErrorI) => {
      if ('error' in response) {
        await notificationStore.showNotification(response.error)
        return
      } else {
        await notificationStore.showNotification('Password changed', true)
        return
      }
    }
  )
}
const resetPasswordField = async () => {
  password.value = ''
  showPasswordField.value = false
}

const changePassword = async () => {
  if (!showPasswordField.value) {
    showPasswordField.value = true
  } else {
    if (password.value === '') {
      notificationStore.showNotification('No new Password set.', true)
    } else {
      await setPassword()
    }
    await resetPasswordField()
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

.channel-manager-info .add-user-button {
  background-color: #ffbd09;
}
.change-password-container {
  width: 100%;
  margin: -1.25px 0 0 0;
  padding: 0;
  box-sizing: border-box;
}

.destroy-container {
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  align-items: flex-start; /* Align items to the start (left) */
}
</style>
