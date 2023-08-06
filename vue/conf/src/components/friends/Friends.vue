<script setup lang="ts">
import Chat from '../chat/Chat.vue'
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { connectWebSocket, disconnectWebSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import type { UserI } from '../../model/user.interface'
import type { FriendshipEntryI } from '../../model/friendshipEntry.interface'
import FriendsListItem from './FriendsListItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import FriendsModal from './FriendsModal.vue'

const notificationStore = useNotificationStore()

const friends = ref<FriendshipEntryI[]>([])
const friendRequests = ref<FriendshipEntryI[]>([])

const modalTitle = ref('')

//right click on friend
const showContextMenuFlag = ref(false)
const contextMenuPosition = ref({ top: 0, left: 0 })
const selectedFriend = ref<FriendshipEntryI | null>(null)

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

interface ModalResult {
  username: string
}

const isModalOpened = ref(false)
const openAddModal = () => {
  modalTitle.value = 'Add a Friend'
  isModalOpened.value = true
}

const openBlockModal = () => {
  modalTitle.value = 'Block a User'
  isModalOpened.value = true
}

const openUnblockModal = () => {
  modalTitle.value = 'Unblock a User'
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleSubmit = computed(() => {
  if (modalTitle.value === 'Add a Friend') {
    return handleAdd
  } else if (modalTitle.value === 'Block a User') {
    return handleBlock
  } else {
    return handleUnblock
  }
})

const handleAdd = ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: friend name cannot be empty', false)
    return
  }

  const accessToken = localStorage.getItem('ponggame') ?? ''
  const socket = connectWebSocket('http://localhost:3000', accessToken)
  socket.emit('sendFriendRequest', username, (response: FriendshipEntryI | { error: string }) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        'Friend Request was sent to ' + response.friend.username,
        true
      )
    }
  })
}

const handleBlock = ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  notificationStore.showNotification(
    'User ' + username + ' was successfully blocked',
    true
  )
}

const handleUnblock = ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  notificationStore.showNotification(
    'User ' + username + ' was successfully unblocked',
    true
  )
}

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
    <FriendsModal
      :isOpened="isModalOpened"
      :title="modalTitle"
      @submit="handleSubmit"
      @close="handleClose"
    />
    <div class="friendsList">
      <h2 v-if="friends.length === 0" class="friends-empty-notification">Friend list is empty</h2>
      <ScrollViewer
        :maxHeight="'68vh'"
        :paddingRight="'.5rem'"
        class="friendsList"
        :class="'messages-scrollviewer'"
      >
        <div v-for="entry in friends" :key="entry.id" @contextmenu="showContextMenu($event, entry)">
          <FriendsListItem
            :status="entry.isOnline ? 'online' : 'offline'"
            :username="entry.friend.username"
          />
        </div>
      </ScrollViewer>
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
      <button class="add-friend-button" @click="openAddModal">Add Friend</button>
      <button class="add-friend-button" @click="openBlockModal">Block User</button>
      <button class="add-friend-button" @click="openUnblockModal">Unblock User</button>

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
    </div>

    <div v-if="showChat" class="chat-container">
      <div class="chat-component">
        <button class="close-button" @click="showChat = false">X</button>
        <!-- <Chat :selectedFriendEntry="selectedFriend" /> -->
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
  margin-bottom: 1rem;
}

.friendsList ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friendInfo {
  display: flex;
  align-items: center;
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

.friends-empty-notification {
  color: gray;
  padding: 1rem 1rem 1rem 0;
  font-size: 1rem;
}

.add-friend-button {
  font-family: 'Courier New', Courier, monospace !important;
  display: block;
  min-width: 90%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  background: transparent;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.25s color ease-out, border 0.25s ease-out;
  margin: 0.5rem 0.5rem 0 0.5rem;
}

.add-friend-button:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}
</style>
