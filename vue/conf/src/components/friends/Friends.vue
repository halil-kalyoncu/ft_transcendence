<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { connectWebSocket, disconnectWebSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import type { UserI } from '../../model/user.interface'
import type { FriendshipEntryI } from '../../model/friendshipEntry.interface'
import FriendsListItem from './FriendsListItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import FriendsModal from './FriendsModal.vue'
import FriendMessages from '../chat/FriendMessages.vue'
import FriendManager from './FriendManager.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '../../stores/userInfo'
import { Socket } from 'socket.io-client'
import jwtDecode from 'jwt-decode'
library.add(faArrowLeft)

const notificationStore = useNotificationStore()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const socket = ref<Socket | null>(null)

const friends = ref<FriendshipEntryI[]>([])
const friendRequests = ref<FriendshipEntryI[]>([])

const modalTitle = ref('')
const showFriendManagerAndChat = ref(false)

const selectedFriend = ref<FriendshipEntryI | null>(null)

const showChat = ref(false)

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

const updateSelectedFriend = () => {
  if (!selectedFriend.value) return

  const updatedFriend = friends.value.find((f) => f.friend.id === selectedFriend.value?.friend.id)

  if (updatedFriend) {
    selectedFriend.value = updatedFriend
  } else {
    closeFriendManagerAndChat()
  }
}

const setFriendData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friendships/get-accepted-friends?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    friends.value = data
    updateSelectedFriend()
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
  }
}

const setFriendRequestData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friendships/get-friend-requests?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    friendRequests.value = data
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, true)
  }
}

const setFriendsListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  socket.value.on('friends', () => {
    console.log('friends listener fired')
    setFriendData()
  })
}

const setFriendRequestListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.on('friendRequests', () => {
    console.log('friendRequests listener fired')
    setFriendRequestData()
  })
}

onMounted(() => {
  initSocket()

  setFriendsListener()
  setFriendRequestListener()

  setFriendData()
  setFriendRequestData()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
  console.log('onBeforeUnmount friends')
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
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  if (username.trim() === '') {
    notificationStore.showNotification('Error: friend name cannot be empty', false)
    return
  }

  socket.value.emit(
    'sendFriendRequest',
    username,
    (response: FriendshipEntryI | { error: string }) => {
      if ('error' in response) {
        notificationStore.showNotification(response.error, false)
      } else {
        notificationStore.showNotification(
          'Friend Request was sent to ' + response.friend.username,
          true
        )
      }
    }
  )
}

const handleBlock = ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  notificationStore.showNotification('User ' + username + ' was successfully blocked', true)
}

const handleUnblock = ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  notificationStore.showNotification('User ' + username + ' was successfully unblocked', true)
}

const closeFriendManagerAndChat = () => {
  showFriendManagerAndChat.value = false
  selectedFriend.value = null
}

const handleFriendManagerOpened = (friend: FriendshipEntryI) => {
  selectedFriend.value = friend
  showFriendManagerAndChat.value = true
}

const acceptFriendRequest = (requestId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  socket.value.emit('acceptFriendRequest', requestId)
  setTimeout(() => {
    setFriendData()
    setFriendRequestData()
    notificationStore.showNotification(`A new friend has been added successfully`, true)
  }, 1250)
}

const rejectFriendRequest = (requestId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('rejectFriendRequest', requestId)
  setTimeout(() => {
    setFriendRequestData()
    notificationStore.showNotification(`You have rejected friend request`, true)
  }, 1250)
}

const handleUnfriendUser = (username: String, id: Number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  if (username !== '') {
    console.log('removeFriend id:' + id + ', username: ' + username)
    socket.value
      .emit('removeFriend', id, (response: any) => {
        console.log('removeFriend response', response)
        if (response && 'success' in response) {
          if (response.success) {
            notificationStore.showNotification(
              `User ${username} was removed from friends list`,
              true
            )
            closeFriendManagerAndChat()
          } else {
            notificationStore.showNotification(
              `Error Could not remove ${username} from friends list: ${response.error}`,
              false
            )
          }
        } else {
          console.error('removeFriend error', response)
          notificationStore.showNotification(
            `Unexpected error occurred while removing ${username} from friends list. Please try again.`,
            false
          )
        }
      })
      .on('error', (error: any) => {
        // Handle case when socket.emit fails
        console.error('Socket emit error', error)
        notificationStore.showNotification(
          `Network error occurred while removing ${username} from friends list. Please try again.`,
          false
        )
      })
  }
}

const handleBlockUser = (username: String, id: Number) => {
  if (username !== '') {
    notificationStore.showNotification('User ' + username + ' was successfully blocked', true)
  }
  closeFriendManagerAndChat()
}

const handleInviteToGame = (username: String, id: Number) => {
  if (username !== '') {
    notificationStore.showNotification('User ' + username + ' was invited to play', true)
  }
}

const goBack = () => {
  closeFriendManagerAndChat()
}
</script>

<template>
  <section class="friends">
    <template v-if="!showFriendManagerAndChat">
      <FriendsModal
        :isOpened="isModalOpened"
        :title="modalTitle"
        @submit="handleSubmit"
        @close="handleClose"
      />
      <div class="friendsList">
        <h2
          v-if="friends === undefined || friends?.length === 0"
          class="friends-empty-notification"
        >
          Friend list is empty
        </h2>
        <ScrollViewer :maxHeight="'68vh'" class="friendsList" :class="'messages-scrollviewer'">
          <div v-for="entry in friends" :key="entry.id" class="scrollviewer-item">
            <FriendsListItem
              @click="handleFriendManagerOpened(entry)"
              :status="entry.isOnline ? 'online' : 'offline'"
              :username="entry.friend.username"
              :showActions="false"
            />
          </div>
        </ScrollViewer>
        <h2 v-if="friendRequests?.length > 0">Friend Requests</h2>
        <ul v-if="friendRequests?.length > 0" class="friendRequestsList">
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
      </div>

      <div v-if="showChat" class="chat-container">
        <div class="chat-component">
          <button class="close-button" @click="showChat = false">X</button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="back-button-container">
        <button class="back-button" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
        </button>
      </div>
      <FriendManager
        @unfriend-user="handleUnfriendUser"
        @block-user="handleBlockUser"
        @invite-user-to-game="handleInviteToGame"
        :selectedFriendEntry="selectedFriend"
      />
      <FriendMessages :selectedFriendEntry="selectedFriend" />
    </template>
  </section>
</template>

<style>
.friends {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
  padding: 1rem 0.5rem 0.5rem 0.5rem;
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

.friendInfo {
  display: flex;
  align-items: center;
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
  margin: 0.5rem 0 0 0;
}

.add-friend-button:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}
</style>
