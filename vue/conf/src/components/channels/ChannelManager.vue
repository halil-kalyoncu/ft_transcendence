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
    <div>
      <button
        v-show="currentUserRole === 'owner'"
        class="join-channel-button"
        :class="'change-password'"
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

    <button class="join-channel-button" @click="leaveChannel">Leave</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/username'
import { useNotificationStore } from '../../stores/notification'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

type User = {
  username: string
  date: string
  role: string
}

const roles = ['owner', 'admin', 'member']
const showPasswordField = ref(false)
const password = ref('')

const getRandomRole = () => roles[Math.floor(Math.random() * roles.length)]

const dummyUserData: User[] = Array.from({ length: 10 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  date: `2023-07-21`,
  role: getRandomRole()
}))

const currentUser = computed(() => dummyUserData.find((user) => user.username === username.value))
// todo: compute currentUserRole instead of static when backend is in place
// const currentUserRole = computed(() => currentUser.value ? currentUser.value.role : 'member');
const currentUserRole = 'owner'

let tempChannelName = 'Computato Potato'
const emit = defineEmits(['channel-left'])
const leaveChannel = () => {
  notificationStore.showNotification('You have left the channel: ' + tempChannelName, true)
  emit('channel-left')
}

const changePassword = () => {
  if (!showPasswordField.value) {
    showPasswordField.value = true
  }
  else
  {
    //todo: fix notification to not share password
    notificationStore.showNotification('Password has been successfully changed to: ' + password.value, true)
    showPasswordField.value = false
  }

}
</script>

<style>
.current-channel-name {
  text-align: center;
  font-size: 1.25rem;
  margin: -1rem 0 0 0;
  font-family: 'Courier New', Courier, monospace !important;
  color: #ea9f42;
}

.channel-manager-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0.5rem 0 0.5rem 0;
}

.channel-manager-info .join-channel-button {
  background-color: red;
  border: none;
  transition: opacity 0.25s ease-out;
}

.channel-manager-info .join-channel-button:hover {
  background-color: red;
  border: none;
  opacity: 0.75;
}

.channel-manager-info .password-input {
  margin: 0;
  max-width: 114px;
}

.change-password {
  background-color: green !important;
}
</style>
