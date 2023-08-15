<script setup lang="ts">
import InvitePlayerAccepted from './InvitePlayerAccepted.vue'
import InviteFriend from './InviteFriend.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { connectWebSocket } from '../../websocket'
import type { UserI } from '../../model/user.interface'
import type { MatchI } from '../../model/match/match.interface'
import { useNotificationStore } from '../../stores/notification'
import { useRouter } from 'vue-router'
import jwtDecode from 'jwt-decode'
import { useRoute } from 'vue-router'
import { Socket } from 'socket.io-client'

const route = useRoute()
const matchId = route.params.matchId as string

const notificationStore = useNotificationStore()
const router = useRouter()

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = ref<Socket | null>(null)

const match = ref<MatchI>({})
const leftPlayer = ref<UserI>({})
const rightPlayer = ref<UserI | null>(null)
const userIsHost = ref(false)

const lobbyIsFinished = ref(false)

const initSocket = () => {
  socket.value = connectWebSocket('http://localhost:3000', accessToken)
}

async function fetchMatchData(matchId: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3000/api/matches/find-by-id?id=${matchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const matchData = await response.json()
      match.value = matchData
      leftPlayer.value = matchData.leftUser
      rightPlayer.value = matchData.rightUser
    } else {
      notificationStore.showNotification(
        'Something went wrong while fetching the match data',
        false
      )
      router.push('/home')
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching the match data', false)
    router.push('/home')
  }
}

const handleHostLeaveMatch = (matchId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('hostLeaveMatch', matchId)
}

const handleLeaveMatch = (matchId: number) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('leaveMatch', matchId)
}

const handleStartMatch = () => {
  if (!userIsHost) {
    return
  }
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  socket.value.emit('startMatch', match.value.id)
}

onMounted(async () => {
  initSocket()
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  const user: UserI = decodedToken.user as UserI

  await fetchMatchData(matchId)

  if (user.id === leftPlayer.value.id) {
    userIsHost.value = true
  }

  socket.value.on('matchInviteSent', (updatedMatch: MatchI) => {
    match.value = updatedMatch
  })

  socket.value.on('matchInviteAccepted', (updatedMatch: MatchI) => {
    match.value = updatedMatch
    rightPlayer.value = match.value.rightUser as UserI
  })

  socket.value.on('matchInviteRejected', (updatedMatch: MatchI) => {
    match.value = updatedMatch
  })

  socket.value.on('hostLeftMatch', () => {
    if (!userIsHost.value) {
      notificationStore.showNotification(
        'Host ' + match.value.rightUser!.username + ' left the match',
        false
      )
      lobbyIsFinished.value = true
      router.push('/home')
    }
  })

  socket.value.on('leftMatch', (updatedMatch: MatchI) => {
    if (userIsHost.value) {
      notificationStore.showNotification(match.value.rightUser!.username + ' left the match', false)
      match.value = updatedMatch
      rightPlayer.value = null
    }
  })

  socket.value.on('goToGame', (updatedMatch: MatchI) => {
    match.value = updatedMatch
    lobbyIsFinished.value = true
    console.log(match.value)
    //router.push(`/game/${matchId}`)
  })
})

onBeforeUnmount(() => {
  if (lobbyIsFinished.value) {
    return
  }
  if (userIsHost.value) {
    handleHostLeaveMatch(match.value.id!)
  } else {
    handleLeaveMatch(match.value.id!)
  }
})
</script>

<template>
  <article class="createCustomGame">
    <span>{{ match.id }}</span>
    <span v-if="userIsHost">This is the host</span>
    <InvitePlayerAccepted v-if="leftPlayer !== null" :user="leftPlayer" />
    <div v-else>Something went wrong</div>
    <InvitePlayerAccepted v-if="rightPlayer !== null" :user="rightPlayer" />
    <InviteFriend v-else :matchId="match.id!" />
    <button
      @click="handleStartMatch"
      :disabled="!userIsHost || !rightPlayer"
      :class="{ disabledButton: !userIsHost || !rightPlayer }"
    >
      start match
    </button>
  </article>
</template>

<style>
.createCustomGame {
  width: 100%;
  height: calc(100vh - 50.8px);
  background-color: #171717;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
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

.disabledButton {
  background-color: gray;
  cursor: not-allowed;
}
</style>
