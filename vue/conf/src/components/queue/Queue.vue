<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { connectChatSocket, connectGameSocket } from '../../websocket'
import { Socket } from 'socket.io-client'
import type { MatchmakingI } from '../../model/match/matchmaking.interface'
import type { UserI } from '../../model/user.interface'
import type { ErrorI } from '../../model/error.interface'
import type { MatchI } from '../../model/match/match.interface'
import jwtDecode from 'jwt-decode'
import Spinner from '../utils/Spinner.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const route = useRoute()
let matchmakingId: string = route.params.matchmakingId as string

const notificationStore = useNotificationStore()
const router = useRouter()

const accessToken = localStorage.getItem('ponggame') ?? ''
const chatSocket = ref<Socket | null>(null)
const gameSocket = ref<Socket | null>(null)

const waitingForGame = ref<boolean>(true)

let timerId: number = 0
const waitingTime = ref<number>(0)
const maxWaitingTime = 1 * 60

const authorized = ref<boolean>(true)
const calledWithUrl = ref<boolean>(false)

const initChatSocket = () => {
  chatSocket.value = connectChatSocket(accessToken)
}

const initGameSocket = (matchId: number) => {
  const query = {
    accessToken: localStorage.getItem('ponggame') ?? '',
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
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matchmaking/${loggedUser.id}`,
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
      const matchmaking: MatchmakingI | null = responseText ? JSON.parse(responseText) : null
      if (!matchmaking) {
        authorized.value = false
        calledWithUrl.value = true
      }
    } else {
      const responseData = await response.json()
      notificationStore.showNotification(
        'Error while fetching the matchmaking data: ' + responseData.message,
        false
      )
      authorized.value = false
    }
  } catch (error) {
    notificationStore.showNotification(
      'Something went wrong while fetching the matchmaking data',
      false
    )
    authorized.value = false
  }
}

const handleSetReady = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  chatSocket.value.emit(
    'setReady',
    parseInt(matchmakingId, 10),
    (response: MatchmakingI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(response.error, false)
        router.push('/home')
      }
    }
  )
}

const handleStartLadderGame = (matchmaking: MatchmakingI) => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  chatSocket.value.emit('startLadderGame', matchmaking.id, (response: MatchmakingI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
      router.push('/home')
    }
  })
}

const handleDeleteMatchmakingEntry = async () => {
  const loggedUser = getUserFromAccessToken()

  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matchmaking/${loggedUser.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (!response.ok) {
      notificationStore.showNotification(
        'Error while delete the matchmaking data: ' + responseData.message,
        false
      )
    }
  } catch (error: any) {
    notificationStore.showNotification(
      'Something went wrong while delete the matchmaking data',
      false
    )
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
  }, 1000) as unknown as number
}

const cancelTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = 0
  }
}

const handleCalledWithUrl = async () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  try {
    const response: MatchmakingI = await new Promise((resolve, reject) => {
      chatSocket.value?.emit('queueUpForLadder', (response: MatchmakingI | ErrorI) => {
        if ('error' in response) {
          reject(response.error)
        } else {
          resolve(response)
        }
      })
    })

    if (!response || response.id === 0) {
      throw new Error('Something went wrong')
    }
    router.push(`/queue/${response.id}`)
    matchmakingId = response.id.toString()
  } catch (error: any) {
    notificationStore.showNotification(error.message, false)
    router.push('/home')
  }
}

onMounted(async () => {
  initChatSocket()
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  await checkAuthorized()
  if (calledWithUrl.value) {
    await handleCalledWithUrl()
  } else if (authorized.value === false) {
    router.push('/home')
    return
  }

  startTimer()

  handleSetReady()

  chatSocket.value.on('readyLadderGame', (matchmaking: MatchmakingI) => {
    handleStartLadderGame(matchmaking)
  })

  chatSocket.value.on('goToLadderGame', (match: MatchI) => {
    waitingForGame.value = false
    initGameSocket(match.id!)
    router.push(`/game/${match.id}`)
  })
})

const handleReloadComponent = watch(
  () => route.params.matchmakingId,
  async (newMatchmakingId) => {
    if (newMatchmakingId) {
      matchmakingId = newMatchmakingId as string
    }
  }
)

onBeforeUnmount(async () => {
  cancelTimer()
  if (authorized.value && waitingForGame.value) {
    await handleDeleteMatchmakingEntry()
  }

  handleReloadComponent()
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  chatSocket.value.off('readyLadderGame')
  chatSocket.value.off('goToLadderGame')
})
</script>
<template>
  <div class="queue">
    <div v-if="waitingForGame" class="waiting-container">
      <Spinner />
      waiting for opponent&nbsp;
      <span class="timer">{{ formattedTimer }}</span>
      <RouterLink class="icon-button-reject" title="Cancel waiting" to="/home">
        <font-awesome-icon :icon="['fas', 'times']" />
      </RouterLink>
    </div>
    <div v-else>Found Game</div>
  </div>
</template>

<style>
.queue {
  width: 100%;
  height: calc(100vh - 50.8px);
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.6);
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-start;
  min-height: 650px;
}

.timer {
  color: #ea9f42;
}

.waiting-container {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.queue .icon-button-reject {
  color: red;
  background: none;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  color: #e47264;
  padding: 5px;
  margin-left: 1rem;
}
</style>
