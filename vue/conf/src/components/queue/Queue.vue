<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { connectChatSocket, connectGameSocket } from '../../websocket'
import { Socket } from 'socket.io-client'
import type { MatchmakingI } from '../../model/match/matchmaking.interface'
import type { UserI } from '../../model/user.interface'
import type { ErrorI } from '../../model/error.interface'
import type { MatchI } from '../../model/match/match.interface'
import jwtDecode from 'jwt-decode'

const route = useRoute()
const matchmakingId: string = route.params.matchmakingId as string

const notificationStore = useNotificationStore()
const router = useRouter()

const accessToken = localStorage.getItem('ponggame') ?? ''
const chatSocket = ref<Socket | null>(null)
const gameSocket = ref<Socket | null>(null)

const waitingForGame = ref<boolean>(true)

let timerId: NodeJS.Timer | null = null
const waitingTime = ref<number>(0)
const maxWaitingTime = 1 * 60

const authorized = ref<boolean>(true)

const initChatSocket = () => {
  chatSocket.value = connectChatSocket(accessToken)
}

const initGameSocket = (matchId: number) => {
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

//check if user is part of this queue
const checkAuthorized = async () => {
  try {
    const loggedUser = getUserFromAccessToken()
    const response = await fetch(`http://localhost:3000/api/matchmaking/${loggedUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const responseText = await response.text()
      const matchmaking: MatchmakingI | null = responseText ? JSON.parse(responseText) : null

      if (!matchmaking) {
        throw Error('You are not authorized to visit this site')
      } else if (matchmaking.id !== parseInt(matchmakingId, 10)) {
        throw Error('Something went wrong while directing to the queue')
      }
    } else {
      throw Error('Something went wrong while fetching the matchmaking data')
    }
  } catch (error: any) {
    notificationStore.showNotification(error.message, false)
    authorized.value = false
    router.push('/home')
  }
}

const handleStartLadderGame = (matchmaking: MatchmakingI) => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  const loggedUser: UserI = getUserFromAccessToken()
  if (matchmaking.userId === loggedUser.id) {
    chatSocket.value.emit('startLadderGame', matchmaking.id, (response: MatchmakingI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(response.error, false)
        router.push('/home')
      }
    })
  }
}

const handleDeleteMatchmakingEntry = async () => {
  const loggedUser = getUserFromAccessToken()

  try {
    const response = await fetch(`http://localhost:3000/api/matchmaking/${loggedUser.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      //const matchmaking: MatchmakingI = await response.json()
    } else {
      throw Error('Something went wrong while delete the matchmaking data')
    }
  } catch (error: any) {
    notificationStore.showNotification(error.message, false)
  }
}

const formattedTimer = computed(() => {
  const minutes = Math.floor(waitingTime.value / 60)
  const seconds = waitingTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  timerId = setInterval(() => {
    waitingTime.value++
    if (waitingTime.value >= maxWaitingTime) {
      cancelTimer()
      notificationStore.showNotification("Couldn't find an opponent, please try again later", false)
      router.push('/home')
    }
  }, 1000)
}

const cancelTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

onMounted(async () => {
  initChatSocket()
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  await checkAuthorized()

  startTimer()

  chatSocket.value.on('readyLadderGame', (matchmaking: MatchmakingI) => {
    waitingForGame.value = false
    handleStartLadderGame(matchmaking)
  })

  chatSocket.value.on('goToLadderGame', (match: MatchI) => {
    waitingForGame.value = false
    initGameSocket(match.id!)
    router.push(`/game/${match.id}`)
  })
})

onBeforeUnmount(async () => {
  cancelTimer()
  if (authorized.value && waitingForGame.value) {
    await handleDeleteMatchmakingEntry()
  }

  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  chatSocket.value.off('readyLadderGame')
  chatSocket.value.off('goToLadderGame')
})
</script>
<template>
  <div v-if="waitingForGame">
    Waiting for game
    <div>{{ formattedTimer }}</div>
  </div>
  <div v-else>Found Game</div>
</template>

<style></style>
