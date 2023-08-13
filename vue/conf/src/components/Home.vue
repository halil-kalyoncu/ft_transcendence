<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { MatchI } from '../model/match/match.interface'
import jwtDecode from 'jwt-decode'
import type { UserI } from '../model/user.interface'
import type { MatchTypeType } from '../model/match/match.interface'
import type { CreateMatchDto } from '../model/match/create-match.dto'
import { useNotificationStore } from '../stores/notification'

const notificationStore = useNotificationStore()
const router = useRouter()

const handleInviteClick = async () => {
  try {
    //getting user from the access token, maybe do this differently
    const accessToken = localStorage.getItem('ponggame') ?? ''
    const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
    const loggedUser: UserI = decodedToken.user as UserI
    const createMatchDto: CreateMatchDto = {
      userId: loggedUser.id as number,
      matchType: 'CUSTOM' as MatchTypeType
    }

    const response = await fetch('http://localhost:3000/api/matches/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createMatchDto)
    })

    if (response.ok) {
      const responseData = await response.json()
      console.log('Response of create match')
      console.log(responseData)
      const matchId = String(responseData.id)
      console.log(matchId)

      router.push(`/invite/${matchId}`)
    } else {
      notificationStore.showNotification('Failed to create a game', false)
    }
  } catch (error) {
    notificationStore.showNotification('Failed to create a game', false)
  }
}
</script>

<template>
  <div class="home">
    <RouterLink class="navButton" to="/game">PLAY</RouterLink>
    <button class="navButton" @click="handleInviteClick">INVITE TO CUSTOM GAME</button>
  </div>
</template>

<style>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100vh - 50.8px);
  background-color: #171717;
}

.home a {
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

.home a:hover {
  background-color: #005600;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
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
