<script setup lang="ts">
import Chat from './Chat.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { connectWebSocket, disconnectWebSocket } from '../websocket'
import { useNotificationStore } from '../stores/notification'
import type { UserI } from '../model/user.interface'
import type { FriendshipEntryI } from '../model/friendshipEntry.interface'

const notificationStore = useNotificationStore()

const friends = ref<FriendshipEntryI[]>([])
const newFriend = ref('')
const userSuggestions = ref<UserI[]>([])
const showSuggestionList = ref(false)
const friendRequests = ref<FriendshipEntryI[]>([])

//right click on friend
const showContextMenuFlag = ref(false)
const contextMenuPosition = ref({ top: 0, left: 0 })
const selectedFriend = ref<FriendshipEntryI | null>(null)

const errorMessage = ref('')

const showChat = ref(false)

onMounted(() => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)

  socket.on('friends', (responseData: FriendshipEntryI[]) => {
    friends.value = responseData
  })

  socket.on('friendRequests', (responseData: FriendshipEntryI[]) => {
    friendRequests.value = responseData
  })
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})

const addFriend = () => {
  if (newFriend.value.trim() === '') {
    return
  }

  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)
  socket.emit(
    'sendFriendRequest',
    newFriend.value,
    (response: FriendshipEntryI | { error: string }) => {
      if ('error' in response) {
        errorMessage.value = response.error
        notificationStore.showNotification(response.error, false)
      } else {
        errorMessage.value = ''
        notificationStore.showNotification(
          'Friend Request was sent to ' + response.friend.username,
          true
        )
      }
    }
  )
  newFriend.value = ''
}

const findUserSuggestions = async (username: string) => {
  if (username.trim() === '') {
    userSuggestions.value = []
    return
  }

  const response = await fetch(
    `http://localhost:3000/api/users/find-by-username?username=${username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  const data = await response.json()
  userSuggestions.value = data
}

const selectSuggestion = (suggestion: UserI) => {
  newFriend.value = suggestion.username || ''
}

const showSuggestions = () => {
  showSuggestionList.value = true
}

const hideSuggestions = () => {
  showSuggestionList.value = false
}

watch(newFriend, (newValue) => {
  findUserSuggestions(newValue)
})

const acceptFriendRequest = (requestId: number) => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)
  socket.emit('acceptFriendRequest', requestId)
}

const rejectFriendRequest = (requestId: number) => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)
  socket.emit('rejectFriendRequest', requestId)
}

const showContextMenu = (event: MouseEvent, friend: FriendshipEntryI) => {
  event.preventDefault()
  selectedFriend.value = friend
  showContextMenuFlag.value = true
  contextMenuPosition.value = { top: event.clientY, left: event.clientX }
}

const handleClickOutsideContextMenu = (event: MouseEvent) => {
  const contextMenu = document.querySelector('.contextMenu') as HTMLElement
  if (contextMenu && !contextMenu.contains(event.target as Node)) {
    showContextMenuFlag.value = false
    selectedFriend.value = null
  }
}

const removeFriendContextMenu = (friend: FriendshipEntryI | null) => {
  if (friend) {
    const accessToken = localStorage.getItem('ponggame') ?? ''
    const socket = connectWebSocket('http://localhost:3000', accessToken)
    socket.emit('removeFriend', friend.id)
  }
  showContextMenuFlag.value = false
  selectedFriend.value = null
}
</script>

<template>
  <section class="friends" @click="handleClickOutsideContextMenu">
    <div class="friendsList">
      <h2>Friends</h2>
      <ul class="friendsList">
        <li v-for="entry in friends" :key="entry.id" @contextmenu="showContextMenu($event, entry)">
          <div class="friendInfo">
            <span>{{ entry.friend.username }}</span>
            <div
              class="statusIndicator"
              :class="{ online: entry.isOnline, offline: !entry.isOnline }"
            ></div>
          </div>
        </li>
      </ul>
      <h2 v-if="friendRequests.length > 0">Friend Requests</h2>
      <ul v-if="friendRequests.length > 0" class="friendRequestsList">
        <li v-for="request in friendRequests" :key="request.id">
          <div class="friendInfo">
            <span>{{ request.friend.username }}</span>
            <button @click="acceptFriendRequest(request.id)">Accept</button>
            <button @click="rejectFriendRequest(request.id)">Reject</button>
          </div>
        </li>
      </ul>
      <input
        type="text"
        v-model="newFriend"
        placeholder="Enter username"
        @focus="showSuggestions"
        @blur="hideSuggestions"
      />
      <div class="suggestionList" v-if="showSuggestionList">
        <ul v-if="userSuggestions.length" class="suggestionList">
          <li
            v-for="suggestion in userSuggestions"
            :key="suggestion.id"
            @mousedown="selectSuggestion(suggestion)"
          >
            {{ suggestion.username }}
          </li>
        </ul>
      </div>
      <button @click="addFriend">Add Friend</button>

      <!-- Right-click menu for friends -->
      <div
        v-show="showContextMenuFlag"
        :style="{ top: contextMenuPosition.top + 'px', left: contextMenuPosition.left + 'px' }"
        class="contextMenu"
      >
        <ul>
          <li @click="showChat = !showChat">Send message</li>
          <li @click="removeFriendContextMenu(selectedFriend)">Remove Friend</li>
        </ul>
      </div>

      <!-- TODO: replace this with error notification -->
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>

    <div v-if="showChat" class="chat-container">
      <div class="chat-component">
        <button class="close-button" @click="showChat = false">X</button>
        <Chat :friend="selectedFriend" />
      </div>
    </div>
  </section>
</template>

<style>
.friends {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
}

.friendsList {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.friendsList ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friendsList li {
  margin-bottom: 10px;
}

.suggestionList {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.suggestionList ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestionList li {
  margin-bottom: 10px;
}

.friendInfo {
  display: flex;
  align-items: center;
}

.statusIndicator {
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 50%;
}

.online {
  background-color: green;
}

.offline {
  background-color: #e2411f;
}

.friendRequestsList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friendRequestsList li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.friendRequestsList li button {
  margin-left: 10px;
}

.contextMenu {
  position: absolute;
  color: black;
  background-color: white;
  border: 1px solid #ccc;
  padding: 0;
  list-style: none;
  z-index: 1000;
}

.contextMenu ul {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.contextMenu li {
  padding: 5px 10px;
  cursor: pointer;
}

.channels > * {
  flex: 1;
}

.friends.error {
  color: red;
  margin-top: 10px;
}

/* chat */
.chat-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100%;
  background-color: #0d1117;
  z-index: 9999;
}

.chat-component {
  position: relative;
  height: 100%;
}

.close-button {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 16px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
