<template>
  <div class="channel-list-item">
    <div class="channel-owner-container" :title="`Joined at: ${date}`" @click="goToProfile">
      <font-awesome-icon class="icon" :icon="getRoleIcon(role)" />
      <p class="channel-owner">{{ username }}</p>
    </div>
    <input
      v-if="showMinutesMutedField"
      v-model="minutesMuted"
      type="number"
      max="100"
      min="0"
      class="password-input"
    />
    <div class="actions">
      <template v-if="currentUserRole === 'owner' && role === 'member'">
        <button class="action-button-make-admin" @click="makeAdmin" title="Make Admin">
          <font-awesome-icon :icon="['fas', 'crown']" />
        </button>
      </template>
      <template
        v-if="currentUserRole === 'owner' || (currentUserRole === 'admin' && role !== 'owner')"
      >
        <button class="action-button-kick" @click="kickUser" title="Kick">
          <font-awesome-icon :icon="['fas', 'futbol']" />
        </button>
        <button class="action-button-ban" @click="banUser" title="Ban">
          <font-awesome-icon :icon="['fas', 'ban']" />
        </button>
        <button
          class="action-button-mute"
          @click="muteUser"
          :title="muteTitle"
          :class="isUserMuted ? 'disableMuteOption' : ''"
        >
          <font-awesome-icon :icon="isUserMuted ? ['fas', 'volume-mute'] : ['fas', 'volume-up']" />
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, watch, watchEffect } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'

library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()
const showMinutesMutedField = ref(false)
const minutesMuted = ref(0)
const maxValue = ref(100)
const isUserMuted = ref(false)
const muteTitle = ref('Mute')

const props = defineProps({
  username: String,
  date: String,
  roleProp: String,
  currentUserRole: String
})

const role = ref(props.roleProp)

watchEffect(() => {
  role.value = props.roleProp
})

watch(minutesMuted, (newValue) => {
  if (newValue > maxValue.value) {
    minutesMuted.value = maxValue.value
  }
})

const goToProfile = () => {
  router.push(`/profile/${props.username}`)
}

const kickUser = () => {
  let kicked = true

  if (kicked) {
    notificationStore.showNotification(props.username + ' was kicked', true)
  }
}

const banUser = () => {
  let banned = true

  if (banned) {
    notificationStore.showNotification(props.username + ' was banned', true)
  }
}

const makeAdmin = () => {
  let madeAdmin = true

  if (madeAdmin) {
    notificationStore.showNotification(props.username + ' became Admin', true)
    role.value = 'admin'
  }
}

const muteUser = () => {
  if (isUserMuted.value === true) {
    return
  }

  if (showMinutesMutedField.value === false) {
    showMinutesMutedField.value = true
    return
  }

  if (minutesMuted.value === 0) {
    notificationStore.showNotification('Error: Minutes to be muted cannot be 0', false)
    return
  }

  let muted = true

  if (muted) {
    notificationStore.showNotification(
      props.username + ' was muted for ' + minutesMuted.value + ' minutes ',
      true
    )
    isUserMuted.value = true
    muteTitle.value = 'User is muted'
  }
  showMinutesMutedField.value = false
  minutesMuted.value = 0
}

const unmuteUser = () => {
  isUserMuted.value = false
  muteTitle.value = 'Mute'
}

const getRoleIcon = (role: string | undefined) => {
  switch (role) {
    case 'admin':
      return ['fas', 'crown']
    case 'member':
      return ['fas', 'user']
    case 'owner':
      return ['fas', 'star']
    default:
      return ['fas', 'question']
  }
}
</script>

<style scoped>
.channel-owner-container {
  cursor: pointer;
}

.channel-list-item {
  cursor: auto !important;
}

.username,
.date {
  margin-right: 10px;
}

.actions {
  display: flex;
}

.action-button-kick,
.action-button-ban,
.action-button-mute,
.action-button-make-admin {
  background: none;
  border: none;
  cursor: pointer;
  color: #e47264;
}

.password-input {
  display: block;
  max-width: 2.5rem;
  margin: 0 0 0 0.5rem;
}

.action-button-ban {
  color: red;
}
.action-button-kick {
  color: yellow;
}

.action-button-mute {
  color: green;
}

.disableMuteOption {
  color: red !important;
  cursor: auto;
}

.action-button-make-admin {
  color: gold;
}
</style>