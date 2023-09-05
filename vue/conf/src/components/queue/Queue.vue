<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { connectChatSocket } from '../../websocket'
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
const socket = ref<Socket | null>(null)

const waitingForGame = ref<boolean>(true)

const initSocket = () => {
  socket.value = connectChatSocket(accessToken)
}

const getUserFromAccessToken = (): UserI => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
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
      const matchmaking: MatchmakingI = await response.json()
      const loggedUser: UserI = getUserFromAccessToken()
      if (!matchmaking) {
        throw Error('Something went wrong while adding you to the queue')
      }
      if (
        matchmaking.userId !== loggedUser.id &&
        matchmaking.opponentUserId &&
        matchmaking.opponentUserId !== loggedUser.id
      ) {
        throw Error('You are not authorized to visit this site')
      } else if (matchmaking.id !== parseInt(matchmakingId, 10)) {
        throw Error('Something went wrong while directing to the queue')
      }
    } else {
      throw Error('Something went wrong while fetching the matchmaking data')
    }
  } catch (error: any) {
    notificationStore.showNotification(error.message, false)
    router.push('/home')
  }
}

const handleStartLadderGame = (matchmaking: MatchmakingI) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  const loggedUser: UserI = getUserFromAccessToken()
  if (matchmaking.userId === loggedUser.id) {
    socket.value.emit(
      'startLadderGame',
      matchmaking.id,
      async (response: MatchmakingI | ErrorI) => {
        if ('error' in response) {
          notificationStore.showNotification(response.error, false)
          router.push('/home')
        }
      }
    )
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

onMounted(async () => {
  initSocket()
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  await checkAuthorized()

  socket.value.on('readyLadderGame', (matchmaking: MatchmakingI) => {
    waitingForGame.value = false
    handleStartLadderGame(matchmaking)
  })

  socket.value.on('goToLadderGame', (match: MatchI) => {
    waitingForGame.value = false
    router.push(`/game/${match.id}`)
  })
})

onBeforeUnmount(async () => {
  if (waitingForGame.value) {
    await handleDeleteMatchmakingEntry()
  }
})
</script>
<template>
  <div v-if="waitingForGame">Waiting for game</div>
  <div v-else>Found Game</div>
</template>

<style></style>
