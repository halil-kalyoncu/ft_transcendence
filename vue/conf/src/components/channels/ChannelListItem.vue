<!-- TODO:
Make badge number visibale. At the moment hidden. Delete big umber next to enter -->
<template>
  <div class="channel-list-item">
    <div class="channel-info">
      <p class="channel-name">{{ channelName }}</p>
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
      <div v-if="unreadMessageCount && unreadMessageCount > 0" class="unread-messages">
        +{{ unreadMessageCount }}
      </div>
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
import { ref, watch, onMounted } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'

library.add(fas)

const props = defineProps({
  isPasswordProtected: Boolean,
  channelName: String,
  ownerName: String,
  joinChannelButtonName: String,
  channelId: Number,
  unreadMessageCount: Number,
  userId: Number
})
//const unreadMessageCount = ref(4)
const emit = defineEmits(['channel-entered'])
const showPasswordField = ref(false)
const password = ref('')
const userBanned = ref(false)
const socket = ref<Socket | null>(null)
const notificationStore = useNotificationStore()

const handleJoin = () => {
  if (props.isPasswordProtected && password.value === '') {
    showPasswordField.value = true
  } else {
    // console.log(
    //   'password: ' +
    //     password.value +
    //     ', channel name: ' +
    //     props.channelName +
    //     ', owner: ' +
    //     props.ownerName +
    //     ', channelId: ' +
    //     props.channelId
    // )
    emit('channel-entered', props.channelId)
  }
}

const tooltipText = () => {
  if (userBanned) {
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

const setUserBanned = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel/isUserBanned?channelId=${props.channelId}&userId=${props.userId}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = response.json()
    userBanned.value = await data
    return
  } catch (error: any) {
    console.error('Error: ', error)
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
}
onMounted(() => {
  initSocket()
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
  background-color: lightgray;
  margin-top: 0.25rem;
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

.envelope-icon {
  width: 100%;
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

.disabled-button {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>
