<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserI } from '../../model/user.interface'
import type { MatchI } from '../../model/match/match.interface'
import { useNotificationStore } from '../../stores/notification'
import { connectChatSocket } from '../../websocket'
import ScrollViewer from '../utils/ScrollViewer.vue'

const props = defineProps({
  matchId: {
    type: String,
    required: true
  }
})

const numericMatchId = parseInt(props.matchId, 10);

const notificationStore = useNotificationStore()

const invitedUsername = ref('')
const invitedUser = ref<UserI | null>(null)
const userSuggestions = ref<UserI[]>([])
const showSuggestionList = ref(false)

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectChatSocket(accessToken)

const findUserSuggestions = async (username: string) => {
  if (username.trim() === '') {
    userSuggestions.value = []
    return
  }

  const response = await fetch(
    `http://localhost:3000/api/users/find-by-username?username=${username}`,
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

const emit = defineEmits(['send-match-invite'])

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

    const response = await fetch(
      `http://localhost:3000/api/users/find?username=${invitedUsername.value}`,
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

    socket.emit('sendMatchInvite', { matchId: props.matchId, invitedUserId: invitedUser.value?.id })

    emit('send-match-invite', invitedUser.value)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.toString() : 'An error occurred'
    notificationStore.showNotification(errorMessage, false)
  }
  invitedUsername.value = ''
}
</script>

<template>
  <div>
    <input type="text" class="invite-friend-input" v-model="invitedUsername" placeholder="Enter username"
      @focus="showSuggestions" @blur="hideSuggestions" />
    <button @click="sendInvite" class="send-game-invitation-button">Send Game Invitation</button>

    <ScrollViewer :maxHeight="'50vh'" class="suggestionList" :class="'game-invite-suggestions'">
      <ul v-if="showSuggestionList && userSuggestions.length" class="suggestionList">
        <li v-for="suggestion in userSuggestions" :key="suggestion.id" @mousedown="selectSuggestion(suggestion)">
          {{ suggestion.username }}
        </li>
      </ul>
    </ScrollViewer>
  </div>
</template>

<style>
.invite-friend-input {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: transparent;
  color: aliceblue;
  border: 1px solid aliceblue;
  margin-right: 1.5rem;
}

.invite-friend-input:focus {
  outline: solid 0.25px #ea9f42;
}

.game-invite-suggestions {
  min-height: 15rem;
  max-width: 228px;
  max-height: 500px;
}

::placeholder {
  color: lightgray;
}

::-moz-placeholder {
  color: aliceblue;
  opacity: 1;
}

::-webkit-input-placeholder {
  color: aliceblue;
}

:-ms-input-placeholder {
  color: aliceblue;
}

::-ms-input-placeholder {
  color: aliceblue;
}
</style>
