<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UserI } from '../../model/user.interface'
import { useNotificationStore } from '../../stores/notification'
import { connectChatSocket } from '../../websocket'
import ScrollViewer from '../utils/ScrollViewer.vue'
import type { SendGameInviteDto } from '../../model/match/sendGameInvite.dto'
import type { MatchI } from '../../model/match/match.interface'
import type { ErrorI } from '../../model/error.interface'
import jwtDecode from 'jwt-decode'

const props = defineProps({
  matchId: {
    type: String,
    required: true
  }
})
const areOptionsDisabled = computed(() => activePanel.value === 'DefaultGame')
const activePanel = ref('DefaultGame')
const selectedGoals = ref('5')
const selectedPowerups = ref([
  { name: 'slowBall', value: false },
  { name: 'fastBall', value: false },
  { name: 'decreasePaddleHeight', value: false },
  { name: 'increasePaddleHeight', value: false },
  { name: 'magnet', value: false }
])
const selectedPowerupNames = computed(() => {
  return selectedPowerups.value.filter((p) => p.value).map((p) => p.name)
})

const numericMatchId = parseInt(props.matchId, 10)

const notificationStore = useNotificationStore()

const invitedUsername = ref('')
const userSuggestions = ref<UserI[]>([])
const showSuggestionList = ref(false)

const accessToken = localStorage.getItem('ponggame') ?? ''
const socket = connectChatSocket(accessToken)

const getUserFromAccessToken = (): UserI => {
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  return decodedToken.user as UserI
}

const findFriendSuggestions = async (usernameSuggestion: string) => {
  if (usernameSuggestion.trim() === '') {
    userSuggestions.value = []
    return
  }

  const loggedUser: UserI = getUserFromAccessToken()
  const userId: string = loggedUser.id?.toString(10) ?? ''
  const response = await fetch(
    `http://localhost:3000/api/friendships/get-like-username?userId=${userId}&username=${usernameSuggestion}`,
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
  findFriendSuggestions(newValue)
})

const sendInvite = async () => {
  try {
    if (invitedUsername.value.trim() === '') {
      notificationStore.showNotification('Invalid username', false)
      return
    }

    const sendGameInviteDto: SendGameInviteDto = {
      matchId: numericMatchId,
      invitedUsername: invitedUsername.value,
      goalsToWin: parseInt(selectedGoals.value, 10),
      powerupNames: selectedPowerupNames.value
    }

    socket.emit('sendMatchInvite', sendGameInviteDto, (response: MatchI | ErrorI) => {
      if ('error' in response) {
        notificationStore.showNotification(response.error, false)
      } else {
        notificationStore.showNotification(
          `Successfully send a match invite to ${response.leftUser?.username}`,
          true
        )
        emit('send-match-invite', response.rightUser)
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.toString() : 'An error occurred'
    notificationStore.showNotification(errorMessage, false)
  }
  invitedUsername.value = ''
}

const setActivePanel = (value: string) => {
  activePanel.value = value
  if (value === 'DefaultGame') {
    selectedGoals.value = '5'
    selectedPowerups.value.forEach((powerup) => {
      powerup.value = false
    })
  }
}

const togglePowerup = (powerupName: string) => {
  const powerup = selectedPowerups.value.find((p) => p.name === powerupName)
  if (powerup) {
    powerup.value = !powerup.value
  }
}
</script>

<template>
  <div class="friend-invite">
    <ul>
      <li
        @click="setActivePanel('DefaultGame')"
        class="navButton"
        :class="{ selected: activePanel === 'DefaultGame' }"
      >
        Default Game
      </li>
      <li
        @click="setActivePanel('CustomGame')"
        class="navButton"
        :class="{ selected: activePanel === 'CustomGame' }"
      >
        Custom Game
      </li>
    </ul>
    <div class="invite-friend-container">
      <input
        type="text"
        class="invite-friend-input"
        v-model="invitedUsername"
        placeholder="Enter username"
        @focus="showSuggestions"
        @blur="hideSuggestions"
      />
      <ScrollViewer :maxHeight="'50vh'" class="suggestionList" :class="'game-invite-suggestions'">
        <ul v-if="showSuggestionList && userSuggestions.length" class="suggestionList">
          <li
            v-for="suggestion in userSuggestions"
            :key="suggestion.id"
            @mousedown="selectSuggestion(suggestion)"
          >
            {{ suggestion.username }}
          </li>
        </ul>
      </ScrollViewer>
    </div>
    <div class="container">
      <div class="radio_container">
        <input
          type="radio"
          name="radio"
          id="three"
          v-model="selectedGoals"
          value="3"
          :disabled="areOptionsDisabled"
        />
        <label for="three" class="goals-label">3 goals</label>
        <input
          type="radio"
          name="radio"
          id="five"
          v-model="selectedGoals"
          value="5"
          :disabled="areOptionsDisabled"
          checked
        />
        <label for="five" class="goals-label">5 goals</label>
        <input
          type="radio"
          name="radio"
          id="eleven"
          v-model="selectedGoals"
          value="11"
          :disabled="areOptionsDisabled"
        />
        <label for="eleven" class="goals-label">11 goals</label>
        <input
          type="radio"
          name="radio"
          id="twentyone"
          v-model="selectedGoals"
          value="21"
          :disabled="areOptionsDisabled"
        />
        <label for="twentyone" class="goals-label">21 goals</label>
      </div>
      <div>Ball Speed</div>
      <div class="button_container">
        <button
          :class="{ selected: selectedPowerups.find((p) => p.name === 'slowBall')?.value }"
          @click="togglePowerup('slowBall')"
          :disabled="areOptionsDisabled"
        >
          slow
        </button>
        <button
          :class="{ selected: selectedPowerups.find((p) => p.name === 'fastBall')?.value }"
          @click="togglePowerup('fastBall')"
          :disabled="areOptionsDisabled"
        >
          fast
        </button>
      </div>
      <div>Paddle Size</div>
      <div class="button_container">
        <button
          :class="{
            selected: selectedPowerups.find((p) => p.name === 'decreasePaddleHeight')?.value
          }"
          @click="togglePowerup('decreasePaddleHeight')"
          :disabled="areOptionsDisabled"
        >
          decrease
        </button>
        <button
          :class="{
            selected: selectedPowerups.find((p) => p.name === 'increasePaddleHeight')?.value
          }"
          @click="togglePowerup('increasePaddleHeight')"
          :disabled="areOptionsDisabled"
        >
          increase
        </button>
      </div>
      <div class="button_container">
        <button
          :class="{ selected: selectedPowerups.find((p) => p.name === 'magnet')?.value }"
          @click="togglePowerup('magnet')"
          :disabled="areOptionsDisabled"
        >
          magnet
        </button>
      </div>
    </div>
    <div class="invite-controls-container">
      <button @click="sendInvite" class="dynamic-button" :class="'send-game-invitation-button'">
        Send Game Invitation
      </button>
      <RouterLink class="send-game-invitation-button" :class="'quit-button'" to="/home">
        Quit
      </RouterLink>
    </div>
  </div>
</template>

<style>
.invite-friend-container {
  position: relative;
}

.invite-friend-input {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: transparent;
  color: aliceblue;
  border: 0.25px solid aliceblue;
  margin: 2rem 0 1rem 0;
  width: 540px;
  font-family: 'Courier New', Courier, monospace !important;
}

.invite-friend-input:focus {
  outline: solid 0.25px #ea9f42;
  border: none;
  padding: 0.55rem 1.05rem;
}

.game-invite-suggestions {
  position: absolute;
  top: 5rem;
  left: 0;
  min-width: 540px;
  background: rgba(0, 0, 0, 0.8);
  max-height: 500px;
  z-index: 100;
}

::placeholder {
  color: aliceblue;
  font-weight: light;
  text-align: center;
}

::-moz-placeholder {
  color: aliceblue;
  opacity: 1;
  font-weight: light;
  text-align: center;
}

::-webkit-input-placeholder {
  color: aliceblue;
  font-weight: light;
  text-align: center;
}

:-ms-input-placeholder {
  color: aliceblue;
  font-weight: light;
  text-align: center;
}

::-ms-input-placeholder {
  color: aliceblue;
  font-weight: light;
  text-align: center;
}

.friend-invite {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem 1.5rem;
  align-items: center;
}

.friend-invite ul {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}

.friend-invite .container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.friend-invite .goals-label {
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: linear 0.3s;
  color: aliceblue;
  border: 1px solid aliceblue;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100%;
  margin: 0 0.5rem;
}

.friend-invite .radio_container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1rem;
  width: calc(540px + 1rem);
}

.friend-invite input[type='radio'] {
  appearance: none;
  display: none;
}

.friend-invite input[type='radio']:checked + label {
  color: #ea9f42;
  font-weight: normal;
  transition: 0.3s;
  border-color: #ea9f42;
}

.friend-invite input[type='radio']:disabled + label {
  opacity: 0.5; /* makes it semi-transparent */
  cursor: not-allowed; /* indicates non-clickable item */
}

.friend-invite .button_container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 1rem;
  width: calc(540px + 1rem);
}

.friend-invite .button_container button {
  appearance: none;
  border: 1px solid aliceblue;
  background-color: rgba(0, 0, 0, 0.8);
  color: aliceblue;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin: 0 0.5rem;
  width: 100%;
  text-align: center;
}

.friend-invite .button_container button.selected {
  color: #ea9f42;
  border-color: #ea9f42;
}

.friend-invite .button_container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invite-controls-container {
  width: 540px;
  display: flex;
  justify-content: space-between;
}

.quit-button {
  text-decoration: none;
  border-color: #ea6442;
  color: #ea6442;
}

.send-invite-button {
  font-weight: light !important;
}
</style>
