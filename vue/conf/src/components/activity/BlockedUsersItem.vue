<template>
  <div class="friend-request-item">
    <div class="friend-info" @click="viewProfile">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-username">{{ username }}</p>
    </div>
    <div class="request-actions">
      <button class="icon-button-view-profile" @click="viewProfile" title="View Profile">
        <font-awesome-icon :icon="['fas', 'eye']" />
      </button>
      <button class="icon-button-unblock" @click="unblockUser" title="Unblock">
        <font-awesome-icon :icon="['fas', 'fa-unlock']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'

library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()

const props = defineProps({
  username: String
})

const viewProfile = () => {
  router.push(`/profile/${props.username}`)
}

const unblockUser = () => {
  notificationStore.showNotification(`You unblocked ${props.username}`, true)
}
</script>

<style></style>
