<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserI } from '../../model/user.interface'
import type { MatchI } from '../../model/match/match.interface'
import { useNotificationStore } from '../../stores/notification'
import { connectWebSocket } from '../../websocket'

const props = defineProps({
  matchId: {
    type: Number,
    required: true
  }
})

const notificationStore = useNotificationStore()

const invitedUsername = ref('')
const invitedUser = ref<UserI | null>(null)
const userSuggestions = ref<UserI[]>([])
const showSuggestionList = ref(false)

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectWebSocket('http://localhost:3000', accessToken)

const findUserSuggestions = async (username: string) => {
  if (username.trim() === '') {
    userSuggestions.value = []
    return
  }

  const response = await fetch(
    `http://localhost:3000/api/users/find-like-username?username=${username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  const data = await response.json()
  userSuggestions.value = data
}

const selectSuggestion = (suggestion: UserI) => {
  invitedUsername.value = suggestion.username || ''
}

const showSuggestions = () => {
  showSuggestionList.value = true
}

const hideSuggestions = () => {
  showSuggestionList.value = false
}

watch(invitedUsername, (newValue) => {
  findUserSuggestions(newValue)
})

const sendInvite = async () => {
  try {
    if (invitedUsername.value.trim() === '') {
      return
    }

    console.log('invite: ' + invitedUsername.value)
    const response = await fetch(
      `http://localhost:3000/api/users/find-by-username?username=${invitedUsername.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.ok) {
      const userData = await response.json()
      invitedUser.value = userData
    } else {
      notificationStore.showNotification('User not found', false)
      return
    }

    socket.emit('sendGameInvite', { matchId: props.matchId, invitedUserId: invitedUser.value?.id })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.toString() : 'An error occurred'
    notificationStore.showNotification(errorMessage, false)
  }
  invitedUsername.value = ''
}
</script>

<template>
  <div>
    <input
      type="text"
      v-model="invitedUsername"
      placeholder="Enter username"
      @focus="showSuggestions"
      @blur="hideSuggestions"
    />
    <div class="suggestionList" v-if="showSuggestionList">
      <ul v-if="userSuggestions.length" class="suggestionList">
        <li
          v-for="suggestion in userSuggestions"
          :key="suggestion.id"
          @mousedown="selectSuggestion(suggestion)"
        >
          {{ suggestion.username }}
        </li>
      </ul>
    </div>
    <button @click="sendInvite">Send Game Invitation</button>
  </div>
</template>
