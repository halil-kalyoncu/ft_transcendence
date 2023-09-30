<template>
  <div class="channel-list-item">
    <div class="channel-info">
      <div class="channel-name-container">
        <p class="channel-name">{{ channelName }}</p>
        <font-awesome-icon
          v-if="isPrivate"
          class="icon"
          :icon="['fas', 'user-secret']"
          title="Private Channel"
        ></font-awesome-icon>
      </div>
      <div class="channel-owner-container">
        <font-awesome-icon class="icon" :icon="['fas', 'star']" />
        <p class="channel-owner">{{ ownerName }}</p>
        <div class="icon-container">
          <font-awesome-icon
            :icon="['fas', 'envelope']"
            class="envelope-icon"
            v-if="unreadMessageCount && unreadMessageCount > 0"
          />
          <span v-if="unreadMessageCount && unreadMessageCount > 0" class="badge-number">{{
            unreadMessageCount
          }}</span>
        </div>
      </div>
      <input
        v-if="showPasswordField"
        v-model="password"
        placeholder="Enter password"
        type="password"
        class="password-input"
      />
    </div>
    <div class="channel-button-container">
      <font-awesome-icon v-if="isPasswordProtected" class="icon" :icon="['fas', 'lock']" />
      <button
        class="join-channel-button"
        @click="handleJoin"
        :disabled="userBanned"
        :class="{ 'disabled-button': userBanned }"
        :title="tooltipText()"
      >
        {{ joinChannelButtonName }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'

library.add(fas)

const props = defineProps({
  isPasswordProtected: Boolean,
  isPrivate: Boolean,
  channelName: String,
  ownerName: String,
  joinChannelButtonNameProps: String,
  channelId: Number,
  unreadMessageCount: Number
})
// const unreadMessageCount = ref(4)
const emit = defineEmits(['channel-entered'])
const showPasswordField = ref(false)

const password = ref('')
const userBanned = ref(false)
const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const username = computed(() => userStore.username)
const isPasswordProtected = props.isPasswordProtected
let joinChannelButtonName = ref(props.joinChannelButtonNameProps)

const handleJoin = async () => {
  if (isPasswordProtected) {
    if (!showPasswordField.value) {
      showPasswordField.value = true
      joinChannelButtonName.value = 'Confirm'
      return
    } else {
      if (password.value === '') {
        notificationStore.showNotification('Error: Password is required')
        return
      } else {
        const correct: boolean = await comparePassword()
        if (!correct) {
          notificationStore.showNotification('Error: Wrong password')
          showPasswordField.value = false
          joinChannelButtonName.value = 'Enter'
          password.value = ''
          return
        } else {
          showPasswordField.value = false
          joinChannelButtonName.value = 'Enter'
          password.value = ''
          emit('channel-entered', props.channelId)
        }
      }
    }
  } else {
    emit('channel-entered', props.channelId)
  }
}

const tooltipText = () => {
  if (userBanned.value) {
    return 'You are banned from this channel'
  } else {
    return 'Go to channel'
  }
}
watch(password, (newValue) => {
  if (newValue) {
  }
})

watch(userBanned, (newValue) => {
  if (newValue) {
  }
})

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const comparePassword = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/comparePassword?channelId=${props.channelId}&password=${password.value}`,
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
      return false
    }
    const correct = await responseData
    return correct
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
    return false
  }
}

const setUserBanned = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/isUserBanned?channelId=${props.channelId}&userId=${userId.value}`,
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
    userBanned.value = await responseData
    return
  } catch (error) {
    notificationStore.showNotification('Something went Wrong', false)
    return
  }
}

const getJoinChannelButtonName = async () => {
  if (showPasswordField.value) {
    return 'Confirm'
  } else {
    return 'Enter'
  }
}

const setBannedFromChannelListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', true)
    return
  }
  socket.value.on('memberBanned', () => {
    console.log('memberBanned fired from JoinedChannelsList.vue')
    setUserBanned()
    return
  })
  socket.value.on(
    'memberUnBanned',
    (unBannedUserName: string, unBanChannelId: number, unBanChannelName: string) => {
      console.log('memberUnBanned fired from JoinedChannelsList.vue')
      if (unBannedUserName === username.value) {
        notificationStore.showNotification(
          'You got unbanned from Channel: ' + unBanChannelName,
          true
        )
      }
      setUserBanned()
      return
    }
  )
}

onBeforeUnmount(() => {
  if (!socket || !socket.value) {
    notificationStore.showNotification('Error: Connection problems', false)
    return
  }

  socket.value.off('memberBanned')
  socket.value.off('memberUnBanned')
})

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
  getJoinChannelButtonName()
  setUserBanned()
  setBannedFromChannelListener()
})
</script>

<style>
.channel-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', Courier, monospace !important;
  width: calc(100%);
  margin: 0 0 0.5rem 0;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  background: transparent;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  transition: 0.25s color ease-out, border 0.25s ease-out;
}

.channel-button-container {
  display: flex;
  align-items: center;
}

.channel-button-container .icon {
  margin-right: 0.5rem;
  color: #c0c0c0;
  font-size: 0.75rem;
}

.channel-name-container {
  display: flex;
  align-items: center;
}

.channel-name-container .icon {
  margin: 0 0.5rem 0.25rem 0;
  margin-left: 0.25rem;
  color: #fff9f9;
  font-size: 0.75rem;
  cursor: pointer;
}

.channel-name {
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
  font-weight: bold;
}

.channel-owner {
  margin: 0;
  padding: 0;
  font-size: 0.8rem;
  color: #ea9f42;
}

.join-channel-button {
  background: #428dea;
  border: 0.5px solid aliceblue;
  font-size: 0.75rem;
  font-weight: light;
  color: #fff;
  box-sizing: border-box;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: 0.125s background-color ease-out, border 0.25s ease-out;
}
.join-channel-button:hover {
  color: aliceblue;
  border: 0.5px solid #ea9f42;
  text-shadow: 0px 0px 1px aliceblue;
  background: #ea9f42;
}

.channel-info {
  display: flex;
  flex-direction: column;
}

.channel-owner-container {
  display: flex;
  align-items: center;
}

.channel-owner-container .icon {
  margin: 0 0.5rem 0.25rem 0;
  color: #c0c0c0;
  font-size: 0.75rem;
}

.password-input {
  display: block;
  max-width: 150px;
  border: none;
  background-color: transparent;
  margin-top: 0.25rem;
  color: aliceblue;
  outline: solid 0.25px aliceblue;
}

.password-input:focus {
  outline: solid 0.25px #ea9f42;
}

.unread-messages {
  background: #428dea;
  border: 0.5px solid aliceblue;
  font-size: 0.75rem;
  font-weight: light;
  color: #fff;
  box-sizing: border-box;
  padding: 0.25rem 0.5rem;
  margin-right: 5px;
}

.icon-container {
  position: relative;
  display: inline-block;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0.5rem;
}

.badge-number {
  position: absolute;
  bottom: 0.3rem;
  left: 100%;
  transform: translate(-50%, 50%);
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 0.65rem;
  height: 0.65rem;
  line-height: 0.65rem;
  text-align: center;
  font-size: 0.55rem;
  font-weight: bold;
}

.envelope-icon {
  width: 100%;
}

.disabled-button {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>
