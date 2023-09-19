<template>
  <div v-if="isOpened" class="modal" @click="handleClickOutside">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">{{ title }}</h2>

      <div class="input-group">
        <input
          id="input-name"
          v-model="inputName"
          placeholder="Enter username"
          type="text"
          class="input-text"
          @focus="showSuggestions"
          @blur="hideSuggestions"
        />
      </div>
      <div class="suggestionList">
        <ScrollViewer :maxHeight="'100px'" :paddingRight="'.5rem'">
          <ul v-if="userSuggestions.length" class="suggestionList">
            <li
              v-for="suggestion in userSuggestions"
              :key="suggestion.id"
              @mousedown="toggleUserSelection(suggestion || '')"
              class="suggested-item"
            >
              <input
                type="checkbox"
                :checked="checkSelection(suggestion)"
                id="check-box"
                :disabled="suggestion.status === 'PENDING'"
              />
              <span class="suggested-item-username">
                {{ suggestion.username }}
              </span>

              <font-awesome-icon
                class="icon"
                :icon="['fas', 'eye']"
                @mousedown="goToProfile(suggestion.username)"
              />
            </li>
          </ul>
        </ScrollViewer>
      </div>
      <div class="button-group">
        <button class="submit-button" @click="submit">OK</button>
        <button class="cancel-button" @click="handleClickOutside">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ChannelInviteeUserI } from '../../model/user.interface'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../../websocket'
import type { ErrorI } from '../../model/error.interface'

library.add(fas)

const notificationStore = useNotificationStore()
const socket = ref<Socket | null>(null)
const router = useRouter()
const inputName = ref('')
const userSuggestions = ref<ChannelInviteeUserI[]>([])
const showSuggestionList = ref(false)
const userStore = useUserStore()
const userId = computed<number>(() => userStore.userId)
const selectedUsers = ref<string[]>([])

const props = defineProps({
  isOpened: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: false
  },

  channelId: {
    type: Number,
    required: true
  }
})

const channelId: Number = props.channelId
const emit = defineEmits(['submit', 'close'])

const checkSelection = (user: ChannelInviteeUserI) => {
  try {
    if (user.status && user.status === 'PENDING') {
      return true
    }
    if (selectedUsers.value.includes(user.username)) {
      return true
    }
    return false
  } catch (error: any) {
    console.error('Error: ', error)
  }
}

const toggleUserSelection = (user: ChannelInviteeUserI) => {
  const index = selectedUsers.value.indexOf(user.username!)
  if (index === -1 && user.status !== 'PENDING') {
    selectedUsers.value.push(user.username)
  } else {
    selectedUsers.value.splice(index, 1)
  }
  inputName.value = ''
}

const sendSubmitEvent = (inviteeUsername: string) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('gotChannelInvitation', inviteeUsername, (response: any | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    }
  })
}

const submit = async () => {
  const userSelected = selectedUsers.value.length
  let error_occured = false
  for (const inviteeUsername of selectedUsers.value) {
    error_occured = await inviteUser(channelId, inviteeUsername, userId.value)
    sendSubmitEvent(inviteeUsername)
  }
  if (!error_occured) {
    if (userSelected === 1) {
      notificationStore.showNotification(`Invitation sent`, true)
    }
    if (userSelected > 1) {
      notificationStore.showNotification(`Invitations sent`, true)
    }
  }
  findUserSuggestions('')
  emit('submit')
}

const inviteUser = async (channelId: Number, inviteeUsername: string, inviterId: Number) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/channel-invitations/InviteUserNameToChannel?channelId=${channelId}&inviteeName=${inviteeUsername}&inviterId=${inviterId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      const responseData = await response.json()
      await notificationStore.showNotification(responseData.message, false)
      return true
    }
    return false
  } catch (error) {
    console.error('Error occurred during login:', error)
    return true
  }
}

const handleClickOutside = () => {
  inputName.value = ''
  emit('close')
}

const findUserSuggestions = async (input: string) => {
  const response = await fetch(
    `http://localhost:3000/api/users/findUsersNotInChannel?channelId=${channelId}`
  )

  if (!response.ok) {
    throw new Error('Could not fetch user suggestions')
  }
  const data = await response.json()
  if (input.trim() === '') {
    userSuggestions.value = data
    for (const user of userSuggestions.value) {
      console.log(user.status)
    }
    return
  }
  // Filter user suggestions based on the provided letters in the right order
  const filteredSuggestions = data.filter((user: any) => {
    const username = user.username.toLowerCase()
    const lettersLower = input.toLowerCase()

    let currentIndex = 0
    for (let i = 0; i < username.length; i++) {
      if (username[i] === lettersLower[currentIndex]) {
        currentIndex++
      }
      if (currentIndex === lettersLower.length) {
        return true // All letters found in the right order
      }
    }
    return false
  })
  userSuggestions.value = filteredSuggestions
}

const showSuggestions = () => {
  showSuggestionList.value = true
}

const hideSuggestions = () => {
  showSuggestionList.value = false
}

watch(inputName, (newValue) => {
  findUserSuggestions(newValue)
})

const goToProfile = (username: String | undefined) => {
  console.log('u9')

  if (username === undefined) {
    return
  }
  router.push(`/profile/${username}`)
}

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const setInvitationUpdateListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.on('ChannelInvitationAccepted', (channelName, UserName) => {
    findUserSuggestions(inputName.value)
  })
  socket.value.on('ChannelInvitationRejected', (channelName, UserName) => {
    findUserSuggestions(inputName.value)
  })
  socket.value.on('NewChannelInvitation', (channelName, UserName) => {
    notificationStore.showNotification('New invitation', true)
    findUserSuggestions(inputName.value)
  })
}

const initSelectedUsers = () => {
  selectedUsers.value = []
}

onMounted(async () => {
  initSelectedUsers()
  await findUserSuggestions('')
  initSocket()
  setInvitationUpdateListener()
})
</script>
<style>
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  max-width: 350px;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #2c3e50;
  border: 0.25px solid darkgray;
  padding: 0.5rem 1rem 1rem;
  color: #ecf0f1;
}

.modal-content .input-text {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  background-color: #34495e;
  color: #ecf0f1;
}

.input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.input-group .label-input-field {
  min-width: 5rem;
  margin-bottom: 20px;
  margin-right: 0.5rem;
  display: block;
}

.modal-content input:focus {
  outline: solid 0.25px #ea9f42;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-button-input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 1rem 0;
}

.radio-button-input-group label {
  padding: 0.25rem 1rem;
  border-bottom: 0.25px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease-out;
}

.radio-button-input-group label:hover {
  color: #ea9f42;
}

.radio-button-input-group input[type='radio']:checked + label {
  border-color: #ea9f42;
  color: #ea9f42;
}

.cancel-button,
.submit-button {
  padding: 0.25rem 1rem;
  border: none;
  color: #ecf0f1;
  min-width: 5rem;
  cursor: pointer;
  transition: all 0.25s ease-out;
}

.cancel-button {
  background-color: transparent;
  border: 0.25px solid #c0392b;
  color: #c0392b;
}

.cancel-button:hover {
  border: 0.25px solid #e74c3c;
  color: #e74c3c;
}

.submit-button {
  background-color: transparent;
  border: 0.25px solid #27ae60;
  color: #27ae60;
}

.submit-button:hover {
  border: 0.25px solid #2ecc71;
  color: #2ecc71;
}

.modal-title {
  text-align: left;
  color: aliceblue;
  font-size: 0.9rem;
  margin: 0 -1rem 1rem;
  padding: 0 1rem 0.5rem;
  border-bottom: 0.25px solid darkgray;
}

.suggestionList {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 0.5rem 0 0;
}

.suggestionList ul {
  list-style: none;
  padding: 0;
  margin: 0 0 0 0;
}

.suggestionList li {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.25s ease-out;
  padding: 0.25rem 0.5rem;
  display: flex;
  justify-content: space-between;
}

.suggestionList li:hover {
  background-color: #4c4e52;
}

.suggestionList li .icon {
  text-align: right;
  transition: color 0.25s ease-out;
}

.suggestionList li .icon:hover {
  color: lightgreen;
}

.suggestionList li .suggested-item-username {
  text-align: right;
}

.statusIndicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.online {
  background-color: green;
}

.offline {
  background-color: #e2411f;
}

.inGame {
  background-color: orange;
}
</style>
