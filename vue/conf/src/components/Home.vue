<script setup lang="ts">
import { useRouter } from 'vue-router'
import jwtDecode from 'jwt-decode'
import type { UserI } from '../model/user.interface'
import type { MatchTypeType } from '../model/match/match.interface'
import type { CreateMatchDto } from '../model/match/create-match.dto'
import { useNotificationStore } from '../stores/notification'
import { onMounted, ref } from 'vue'
import { Socket } from 'socket.io-client'
import { connectChatSocket } from '../websocket'
import type { ErrorI } from '../model/error.interface'
import type { MatchmakingI } from '../model/match/matchmaking.interface'

const notificationStore = useNotificationStore()
const router = useRouter()

const socket = ref<Socket | null>(null)

const getUserFromAccessToken = (): UserI => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  return decodedToken.user as UserI
}

const handleQueueUpLadder = async () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.emit('queueUpForLadder', (response: MatchmakingI | ErrorI) => {
    if ('error' in response) {
      notificationStore.showNotification(response.error, false)
    } else {
      router.push(`/queue/${response.id}`)
    }
  })
}

const handleInviteClick = async () => {
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
      const matchId = String(responseData.id)
      router.push(`/invite/${matchId}`)
    } else {
      notificationStore.showNotification('Failed to create a game: ' + responseData.message, false)
    }
  } catch (error: any) {
    notificationStore.showNotification('Something went wrong when creating a game', false)
  }
}

const initSocket = () => {
  const accessToken = localStorage.getItem('ponggame') ?? ''
  socket.value = connectChatSocket(accessToken)
}

const handleShowLeaderboard = () => {
  router.push('/leaderboard')
}

onMounted(() => {
  initSocket()
})
</script>

<template>
  <div class="home">
    <button @click="handleQueueUpLadder" class="dynamic-button" :class="'margin-right-queue'">
      QUEUE UP FOR LADDER GAME
    </button>
    <button @click="handleInviteClick" class="dynamic-button" :class="'margin-right-queue'">
      START A CUSTOM GAME
    </button>
    <button @click="handleShowLeaderboard" class="dynamic-button">SHOW LEADERBOARD</button>
  </div>
</template>

<style>
.home {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: calc(100vh - 50.8px);
  background: rgba(0, 0, 0, 0.6);
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  min-height: 650px;
}

.play-button {
  padding: 0 2.5rem;
  font-size: 2rem;
  background-color: #32a852;
  color: #ffffff;
  border: none;
  transition: all 0.25s ease-in;
  cursor: pointer;
  outline: none;
  text-decoration: none;
  animation: appear 0.5s ease-out;
}

.play-button:hover {
  background-color: #005600;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
}

.send-game-invitation-button {
  background-color: transparent;
  border: 1px solid #ea9f42;
  color: #ea9f42;
  transition: 0.3s;
  padding: 0.55rem 1rem;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
}
.send-game-invitation-button:hover {
  background-color: transparent;
}

.margin-right-queue {
  margin-right: 1.5rem;
}

@keyframes appear {
  from {
    background-color: #005600;
    transform: scale(1.25);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
  }
  to {
    transform: scale(1);
  }
}
</style>
