<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { connectWebSocket } from '../../websocket'
import { useNotificationStore } from '../../stores/notification'
import type { UserI } from '../../model/user.interface'
import type { FriendshipI } from '../../model/friendship/friendship.interface'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'
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
import type { MatchI } from '../../model/match/match.interface'
import { useRouter } from 'vue-router'
import type { ErrorI } from '../../model/error.interface'
import type { UnreadMessageI } from '../../model/message/unreadMessage.interface'
import type { DirectConverstationDto } from '../../model/message/directConversation.dto'
library.add(faArrowLeft)

const notificationStore = useNotificationStore()
const router = useRouter()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const socket = ref<Socket | null>(null)

const friends = ref<FriendshipEntryI[]>([])
const friendRequests = ref<FriendshipEntryI[]>([])
const matchInvites = ref<MatchI[]>([])
const unreadMessages = ref<UnreadMessageI[]>([])

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

const fetchUser = async (username: string): Promise<UserI> => {
  const response = await fetch(`http://localhost:3000/api/users/find?username=${username}`)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  return await response.json()
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
    notificationStore.showNotification(`Error` + error.message, false)
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
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const setMatchInviteData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/matches/invites-by-userId?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    matchInvites.value = data
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const setDirectMessageData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/directMessages/allUnreadByUserId?userId=${userId.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    unreadMessages.value = data
    console.log('unreadMessages')
    console.log(unreadMessages.value)
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const setFriendsListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.on('friends', () => {
    console.log('friends listener fired')
    setFriendData()
  })
}

const setFriendRequestListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('friendRequests', () => {
    console.log('friendRequests listener fired')
    setFriendRequestData()
  })
}

const setMatchInviteListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('matchInvites', () => {
    console.log('matchInvites listener fired')
    setMatchInviteData()
  })
}

const setDirectMessageListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('newDirectMessage', () => {
    console.log('newDirectMessage listener fired')
    setDirectMessageData()
  })
}

const unreadMessageReactive = computed(() => {
  const counts: { [key: number]: number } = {}

  for (const message of unreadMessages.value) {
    counts[message.senderId] = message.amountUnread
  }

  return counts
})

onMounted(() => {
  initSocket()

  setFriendsListener()
  setFriendRequestListener()
  setMatchInviteListener()
  setDirectMessageListener()

  setFriendData()
  setFriendRequestData()
  setMatchInviteData()
  setDirectMessageData()
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
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  if (username.trim() === '') {
    notificationStore.showNotification('Error: friend name cannot be empty', false)
    return
  }

  socket.value.emit('sendFriendRequest', username, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        'Friend Request was sent to ' + response.receiver!.username,
        true
      )
    }
  })
}

const handleBlock = async ({ username }: ModalResult) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  try {
    const blockUser: UserI = await fetchUser(username)
    if (!blockUser) {
      throw new Error("Couldn't find user " + username)
    }
    socket.value.emit('blockUser', blockUser.id!, (response: FriendshipI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(
          `Error Could not block ${username}: ${response.error}`,
          false
        )
      } else {
        notificationStore.showNotification('User ' + username + ' was successfully blocked', true)
      }
    })
  } catch (error: any) {
    notificationStore.showNotification('Error: ' + error.message, false)
  }
}

const handleUnblock = async ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }
  try {
    console.log(username)
    const unblockUser: UserI = await fetchUser(username)
    if (!unblockUser) {
      throw new Error("Couldn't find user " + username)
    }
    const response = await fetch('http://localhost:3000/api/friendships/unblock-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId.value,
        unblockUserId: unblockUser.id
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    notificationStore.showNotification('User ' + username + ' was successfully unblocked', true)
  } catch (error: any) {
    notificationStore.showNotification('Error: ' + error.message, false)
  }
}

const closeFriendManagerAndChat = async () => {
  showFriendManagerAndChat.value = false
  if (selectedFriend.value) {
    await markConversationAsRead(selectedFriend.value.friend.id!)
    await setDirectMessageData()
  }
  selectedFriend.value = null
}

const handleFriendManagerOpened = (friend: FriendshipEntryI) => {
  selectedFriend.value = friend
  showFriendManagerAndChat.value = true
}

const acceptFriendRequest = (requestId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('acceptFriendRequest', requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        response.sender!.username + 'has been added as a friend',
        true
      )
    }
  })
}

const rejectFriendRequest = (requestId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.emit('rejectFriendRequest', requestId, (response: FriendshipI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      notificationStore.showNotification(
        'The friend request from ' + response.sender!.username + 'has been rejected',
        true
      )
    }
  })
}

const acceptMatchInvite = (matchId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('acceptMatchInvite', matchId)
  router.push(`/invite/${matchId}`)
}

const rejectMatchInvite = (matchId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('rejectMatchInvite', matchId)
}

const handleUnfriendUser = (username: String, friendshipId: Number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  if (username !== '') {
    socket.value.emit('removeFriend', friendshipId, (response: FriendshipI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(
          `Error Could not remove ${username} from friends list: ${response.error}`,
          false
        )
      } else {
        notificationStore.showNotification(`User ${username} was removed from friends list`, true)
      }
    })
  }
}

const handleBlockUser = (username: String, blockUserId: Number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  if (username !== '') {
    socket.value.emit('blockUser', blockUserId, (response: FriendshipI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(
          `Error Could not remove ${username} from friends list: ${response.error}`,
          false
        )
      } else {
        notificationStore.showNotification(`User ${username} was removed from friends list`, true)
      }
    })
  }
  closeFriendManagerAndChat()
}

const handleInviteToGame = (username: String, id: Number) => {
  if (username !== '') {
    notificationStore.showNotification('User ' + username + ' was invited to play', true)
  }
}

const markConversationAsRead = async (withUserId: number) => {
  try {
    const directConversationDto: DirectConverstationDto = {
      readerUserId: userId.value as number,
      withUserId: withUserId
    }

    const response = await fetch('http://localhost:3000/api/directMessages/markAsRead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(directConversationDto)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    if (Array.isArray(data)) {
    } else {
      console.error('Expected an array from the API but received:', data)
    }
  } catch (error: any) {
    console.error('Expected an array from the API but received:', error)
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
              :unreadMessagesAmount="unreadMessageReactive[entry.friend.id!] || 0"
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
        <h2 v-if="matchInvites?.length > 0">MatchInvites</h2>
        <ul v-if="matchInvites?.length > 0">
          <li v-for="invite in matchInvites" :key="invite.id">
            <div class="friendInfo">
              <span v-if="invite.leftUser"
                >Custom game invite from {{ invite.leftUser.username }}
              </span>
              <button @click="acceptMatchInvite(invite.id as number)">Accept</button>
              <button @click="rejectMatchInvite(invite.id as number)">Reject</button>
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
