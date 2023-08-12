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

const props = defineProps({
    matchId: {
        type: String,
        required: true
    }
})

const notificationStore = useNotificationStore()
const router = useRouter();

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectWebSocket('http://localhost:3000', accessToken)

const match = ref<MatchI>({})
const leftPlayer = ref<UserI>({})
const rightPlayer = ref<UserI>({})
const userIsHost = ref(false)

async function fetchMatchData(matchId: string): Promise<void> {
    try {
        console.log('fetching id ' + matchId)
        const response = await fetch(`http://localhost:3000/api/matches/find-by-id?id=${matchId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            const matchData = await response.json();
            match.value = matchData;
            leftPlayer.value = matchData.leftUser
            rightPlayer.value = matchData.rightUser
        }
        else {
            console.log('response wrong')
            notificationStore.showNotification('Something went wrong while fetching the match data', false)
            router.push('/home')
        }
    }
    catch (error) {
        console.log('error')
        notificationStore.showNotification('Something went wrong while fetching the match data', false)
        router.push('/home')
    }
}

async function deleteMatch(matchId: string): Promise<void> {
    try {
        const response = await fetch(`http://localhost:3000/api/matches/delete-by-id?id=${matchId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            
        }
        else {
            notificationStore.showNotification('Something went wrong while delete the match from the database', false)
        }
    }
    catch (error) {
        notificationStore.showNotification('Something went wrong while delete the match from the database', false)
    }
}

socket.on('friendInvited', (updatedMatch: MatchI) => {
  match.value = updatedMatch
})

onMounted(async () => {
    console.log(props);
    const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
    const user: UserI = (decodedToken.user as UserI)

    console.log(props.matchId)
    await fetchMatchData(props.matchId)

    if (user.id === leftPlayer.value.id) {
        userIsHost.value = true
    }
})

onBeforeUnmount(() => {
    deleteMatch(props.matchId)
})
</script>

<template>
    <article class="createCustomGame">
        <span>{{ match.id }}</span>
        <span v-if="userIsHost">This is the host</span>
        <InvitePlayerAccepted v-if="leftPlayer !== null" :user="leftPlayer"/>
        <div v-else>Something went wrong</div>
        <InvitePlayerAccepted v-if="rightPlayer !== null" :user="rightPlayer"/>
        <InviteFriend v-else :matchId="match.id!"/>
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

</style>