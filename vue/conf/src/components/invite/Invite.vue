<script setup lang="ts">
import Spinner from '../utils/Spinner.vue'
import InviteFriend from './InviteFriend.vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { connectChatSocket, connectGameSocket } from '../../websocket'
import type { UserI } from '../../model/user.interface'
import type { MatchI } from '../../model/match/match.interface'
import { useNotificationStore } from '../../stores/notification'
import { useRouter } from 'vue-router'
import jwtDecode from 'jwt-decode'
import { useRoute } from 'vue-router'
import { Socket } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { CreateMatchDto } from '../../model/match/create-match.dto'
import type { MatchTypeType } from '../../model/match/match.interface'

const route = useRoute()
let matchId = route.params.matchId as string

const notificationStore = useNotificationStore()
const router = useRouter()

const accessToken = localStorage.getItem('ponggame') ?? ''
const chatSocket = ref<Socket | null>(null)
const gameSocket = ref<Socket | null>(null)

const match = ref<MatchI>({})
const leftPlayer = ref<UserI>({})
const rightPlayer = ref<UserI | null>(null)
const userIsHost = ref(false)
const isWaitingForResponse = ref(false)

const lobbyIsFinished = ref(false)

const authorized = ref<boolean>(true)
const calledWithUrl = ref<boolean>(false)

const initChatSocket = () => {
  chatSocket.value = connectChatSocket(accessToken)
}

const initGameSocket = () => {
  const user: UserI = getUserFromAccessToken()
  const query = {
    userId: user.id,
    matchId
  }
  gameSocket.value = connectGameSocket(query)
}

const getUserFromAccessToken = (): UserI => {
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  return decodedToken.user as UserI
}

const handleCalledWithUrl = async () => {
  try {
    const loggedUser: UserI = getUserFromAccessToken()
    const createMatchDto: CreateMatchDto = {
      userId: loggedUser.id as number,
      matchType: 'CUSTOM' as MatchTypeType
    }

    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matches/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        },
        body: JSON.stringify(createMatchDto)
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      const newMatchId = String(responseData.id)
      router.push(`/invite/${newMatchId}`)
    } else {
      notificationStore.showNotification('Failed to create a game: ' + responseData.message, false)
    }
  } catch (error: any) {
    notificationStore.showNotification('Something went wrong when creating a game', false)
  }
}

async function fetchMatchData(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matches/find-by-id?id=${matchId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    if (response.ok) {
      const responseText = await response.text()
      const matchData: MatchI | null = responseText ? JSON.parse(responseText) : null

      if (
        !matchData ||
        matchData.state === 'STARTED' ||
        matchData.state === 'DISCONNECTLEFT' ||
        matchData.state === 'DISCONNECTRIGHT' ||
        matchData.state === 'WINNERLEFT' ||
        matchData.state === 'WINNERRIGHT'
      ) {
        authorized.value = false
        calledWithUrl.value = true
        return
      }
      match.value = matchData as MatchI
      leftPlayer.value = matchData!.leftUser as UserI
      rightPlayer.value = matchData!.rightUser as UserI
      if (match.value.rightUser && match.value.state === 'INVITED') {
        isWaitingForResponse.value = true
      }
    } else {
      const responseData = await response.json()
      notificationStore.showNotification(
        'Error while fetching the match data: ' + responseData.message,
        false
      )
      router.push('/home')
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching the match data', false)
    router.push('/home')
  }
}

//check if match object is correct and user is part of this queue
const checkAuthorized = (user: UserI): boolean => {
  if (!match.value) {
    notificationStore.showNotification('Unexpected error occured', false)
    return false
  } else if (match.value.id! !== parseInt(matchId, 10)) {
    notificationStore.showNotification('Something went wrong while directing to the lobby', false)
    return false
  }

  if (user.id! === match.value.leftUserId!) {
    return true
  } else if (match.value.rightUserId && match.value.rightUserId! === user.id!) {
    return true
  }
  notificationStore.showNotification('You are not a part of this lobby', false)
  return false
}

const handleHostLeaveMatch = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  chatSocket.value.emit('hostLeaveMatch', parseInt(matchId, 10))
}

const handleLeaveMatch = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  chatSocket.value.emit('leaveMatch', parseInt(matchId, 10))
}

const handleCancelWaiting = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  chatSocket.value.emit('cancelMatchInvite', parseInt(matchId, 10))
}

const handleStartMatch = () => {
  if (!userIsHost) {
    return
  }
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  chatSocket.value.emit('startMatch', match.value.id)
}

const setupComponent = async () => {
  await fetchMatchData()
  if (calledWithUrl.value) {
    handleCalledWithUrl()
    return
  }

  const user: UserI = getUserFromAccessToken()
  if (!checkAuthorized(user)) {
    authorized.value = false
    return
  }

  if (user.id === leftPlayer.value.id) {
    userIsHost.value = true
  }
}

const setEventListener = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  chatSocket.value.on('matchInviteSent', (updatedMatch: MatchI) => {
    match.value = updatedMatch
  })

  chatSocket.value.on('matchInviteAccepted', (updatedMatch: MatchI) => {
    match.value = updatedMatch
    rightPlayer.value = match.value.rightUser as UserI
    isWaitingForResponse.value = false
  })

  chatSocket.value.on('matchInviteRejected', (updatedMatch: MatchI) => {
    notificationStore.showNotification(
      `${match.value.rightUser?.username} rejected your invite`,
      false
    )
    rightPlayer.value = null
    match.value = updatedMatch
    isWaitingForResponse.value = false
  })

  chatSocket.value.on('matchInviteCanceled', (updatedMatch: MatchI) => {
    rightPlayer.value = null
    match.value = updatedMatch
    isWaitingForResponse.value = false
  })

  chatSocket.value.on('hostLeftMatch', () => {
    if (!userIsHost.value) {
      notificationStore.showNotification(
        'Host ' + match.value.leftUser!.username + ' left the match',
        false
      )
      lobbyIsFinished.value = true
      router.push('/home')
    }
  })

  chatSocket.value.on('leftMatch', (updatedMatch: MatchI) => {
    if (userIsHost.value) {
      notificationStore.showNotification(match.value.rightUser!.username + ' left the match', false)
      match.value = updatedMatch
      rightPlayer.value = null
      isWaitingForResponse.value = false
    }
  })

  chatSocket.value.on('goToGame', (updatedMatch: MatchI) => {
    match.value = updatedMatch
    lobbyIsFinished.value = true
    initGameSocket()
    router.push(`/game/${matchId}`)
  })
}

onMounted(async () => {
  initChatSocket()
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  await setupComponent()
  if (!authorized.value) {
    router.push('/home')
  }
  setEventListener()
})

const handleSendMatchInvite = (user: UserI | null) => {
  if (user) {
    isWaitingForResponse.value = true
    rightPlayer.value = user
  }
}

const cancelWaiting = () => {
  isWaitingForResponse.value = false
  handleCancelWaiting()
}

const handleReloadComponent = watch(
  () => route.params.matchId,
  async (newMatchId) => {
    if (newMatchId) {
      matchId = newMatchId as string
    }
  }
)

const handleUnmountComponent = () => {
  if (authorized.value) {
    if (!lobbyIsFinished.value && userIsHost.value) {
      handleHostLeaveMatch()
    } else if (!lobbyIsFinished.value && !userIsHost.value) {
      handleLeaveMatch()
    }
  }
}

const unsetEventListener = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  chatSocket.value.off('matchInviteSent')
  chatSocket.value.off('matchInviteAccepted')
  chatSocket.value.off('matchInviteRejected')
  chatSocket.value.off('hostLeftMatch')
  chatSocket.value.off('leftMatch')
  chatSocket.value.off('goToGame')
}

onBeforeUnmount(() => {
  handleUnmountComponent()
  handleReloadComponent()
  unsetEventListener()
})
</script>

<template>
  <article class="createCustomGame">
    <InviteFriend
      v-if="!rightPlayer"
      :matchId="matchId"
      @send-match-invite="handleSendMatchInvite"
    />
    <div v-else-if="isWaitingForResponse" class="waiting-container">
      <Spinner />
      <span
        >waiting for <span class="orange-font">{{ rightPlayer?.username }}</span
        >...</span
      >
      <button class="icon-button-reject" title="Cancel request" @click="cancelWaiting">
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
    </div>
    <div v-else class="flex-row">
      <p v-if="userIsHost">
        '<span class="orange-font">{{ rightPlayer.username }}</span
        >' is ready to play
      </p>

      <p v-else class="waiting-container">
        <Spinner />
        waiting for '<span class="orange-font">{{ leftPlayer.username }} </span> ' to launch game...
      </p>
      <button v-if="userIsHost" class="dynamic-button" @click="handleStartMatch">
        Launch Game
      </button>
    </div>
  </article>
</template>

<style>
.orange-font {
  color: #ea9f42;
  font-weight: bold;
}

.createCustomGame .icon-button-reject {
  color: red;
  background: none;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  color: #e47264;
  padding: 5px;
  margin-left: 1rem;
}

.createCustomGame {
  width: 100%;
  height: calc(100vh - 50.8px);
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-start;
  min-height: 650px;
}

.flex-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.suggestionList {
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

.waiting-container {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

@keyframes entranceAnimation {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dynamic-button {
  animation: entranceAnimation 0.5s forwards;
  background-color: transparent;
  border: 1px solid #ea9f42;
  color: #ea9f42;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.dynamic-button:hover {
  background-color: #ea9f42;
  color: white;
}

.dynamic-button:active {
  transform: scale(0.95);
  background-color: #d97c30;
}

.dynamic-button:before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background: linear-gradient(45deg, #ea9f42, transparent, #ea9f42);
  transform: skewX(-20deg) scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.dynamic-button:hover:before {
  transform: skewX(-20deg) scaleX(1);
}
</style>
