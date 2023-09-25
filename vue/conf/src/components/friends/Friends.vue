<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { connectChatSocket } from '../../websocket'
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
import type { ErrorI } from '../../model/error.interface'
import type { UnreadMessageI } from '../../model/message/unreadMessage.interface'
import type { DirectConverstationDto } from '../../model/message/directConversation.dto'
import router from '../../router'
library.add(faArrowLeft)

const notificationStore = useNotificationStore()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const socket = ref<Socket | null>(null)

const friends = ref<FriendshipEntryI[]>([])
const unreadMessages = ref<UnreadMessageI[]>([])

const modalTitle = ref('')
const showFriendManagerAndChat = ref(false)

const selectedFriend = ref<FriendshipEntryI | null>(null)

const showChat = ref(false)

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
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

const fetchUser = async (username: string): Promise<UserI | null> => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/find?username=${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      }
    })

    const responseData = await response.json()
    if (response.ok) {
      return responseData
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

const setFriendData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/friendships/get-accepted-friends?userId=${userId.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      friends.value = responseData
      updateSelectedFriend()
    } else {
      notificationStore.showNotification('Error while fetching friends', false)
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching friends', false)
  }
}

const setDirectMessageData = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/directMessages/allUnreadByUserId?userId=${userId.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      unreadMessages.value = responseData
    } else {
      notificationStore.showNotification(
        'Error while fetching unread messages: ' + responseData.message,
        false
      )
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching unread messages', false)
  }
}

const setFriendsListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.on('friends', () => {
    setFriendData()
  })
}

const setDirectMessageListener = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }
  socket.value.on('newDirectMessage', () => {
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

  setFriendsListener()
  setDirectMessageListener()

  setFriendData()
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
      notificationStore.showNotification('Friend Request was successfully sent', true)
    }
  })
}

const handleBlock = async ({ username }: ModalResult) => {
  isModalOpened.value = false

  if (username.trim() === '') {
    notificationStore.showNotification('Error: user name cannot be empty', false)
    return
  }

  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  try {
    const blockUser: UserI | null = await fetchUser(username)
    if (!blockUser) {
      throw new Error("Couldn't find user " + username)
    }

    socket.value.emit('blockUser', blockUser.id as number, (response: any) => {
      if ('error' in response) {
        notificationStore.showNotification(`Error: ${response.error}`, false)
      } else {
        notificationStore.showNotification(`User ${username} was successfully blocked`, true)
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

  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  try {
    const unblockUser: UserI | null = await fetchUser(username)
    if (!unblockUser) {
      throw new Error("Couldn't find user " + username)
    }

    socket.value.emit('unblockUser', unblockUser.id as number, (response: any) => {
      if ('error' in response) {
        notificationStore.showNotification(`Error: ${response.error}`, false)
      } else {
        notificationStore.showNotification(`User ${username} was successfully unblocked`, true)
      }
    })
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

const handleBlockUser = async (username: string, blockUserId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  if (username !== '') {
    try {
      const blockUser: UserI | null = await fetchUser(username)
      if (!blockUser) {
        throw new Error("Couldn't find user " + username)
      }

      socket.value.emit('blockUser', blockUser.id as number, (response: any) => {
        if ('error' in response) {
          notificationStore.showNotification(`Error: ${response.error}`, false)
        } else {
          notificationStore.showNotification(`User ${username} was successfully blocked`, true)
        }
      })
    } catch (error: any) {
      notificationStore.showNotification('Error: ' + error.message, false)
    }
  }
}

const handleUnblockUser = async (username: string, unblockUserId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  if (username !== '') {
    try {
      const unblockUser: UserI | null = await fetchUser(username)
      if (!unblockUser) {
        throw new Error("Couldn't find user " + username)
      }

      socket.value.emit('unblockUser', unblockUser.id as number, (response: any) => {
        if ('error' in response) {
          notificationStore.showNotification(`Error: ${response.error}`, false)
        } else {
          notificationStore.showNotification(`User ${username} was successfully blocked`, true)
        }
      })
    } catch (error: any) {
      notificationStore.showNotification('Error: ' + error.message, false)
    }
  }
}

const handleInviteToGame = (username: String, id: Number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  try {
    socket.value.emit('sendMatchInviteViaChat', id, (response: MatchI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(`Error: ${response.error}`, false)
      } else {
        notificationStore.showNotification(`Send a game invitation to ${username}`, true)
        router.push(`/invite/${response.id!}`)
      }
    })
  } catch (error: any) {
    notificationStore.showNotification('Error: ' + error.message, false)
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
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      },
      body: JSON.stringify(directConversationDto)
    })

    const responseData = await response.json()
    if (response.ok) {
      if (Array.isArray(responseData)) {
      } else {
        notificationStore.showNotification(
          'Something went wrong while marking the direct messages as read',
          false
        )
      }
    } else {
      notificationStore.showNotification(
        'Error while marking the direct messages as read: ' + responseData.message,
        false
      )
    }
  } catch (error: any) {
    notificationStore.showNotification(
      'Something went wrong while marking the direct messages as read',
      false
    )
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
              :status="entry.status!"
              :blocked="entry.blocked!"
              :username="entry.friend.username"
              :unreadMessagesAmount="unreadMessageReactive[entry.friend.id!] || 0"
              :showActions="false"
            />
          </div>
        </ScrollViewer>
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
        @unblock-user="handleUnblockUser"
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
  padding: 1rem 0.5rem 1rem 0.5rem;
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
