<template>
  <div class="channel-list-item">
    <div class="channel-owner-container" :title="`Joined at: ${date}`" @click="goToProfile">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="channel-owner">{{ username }}</p>
    </div>
    <i class="fas" :class="'fa-angle-up positive'"></i>
    <div class="actions">
      <button class="action-button-kick" @click="kickUser" title="Kick">
        <font-awesome-icon :icon="['fas', 'futbol']" />
      </button>
      <button class="action-button-ban" @click="banUser" title="Ban">
        <font-awesome-icon :icon="['fas', 'ban']" />
      </button>
      <button class="action-button-mute" @click="muteUser" title="Mute">
        <font-awesome-icon :icon="['fas', 'volume-mute']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
const router = useRouter()

const props = defineProps({
  username: String,
  date: String
})

const goToProfile = () => {
  router.push(`/profile/${props.username}`)
}

const kickUser = () => {}

const banUser = () => {}

const muteUser = () => {}
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
.action-button-mute {
  background: none;
  border: none;
  cursor: pointer;
  color: #e47264;
}
</style>
