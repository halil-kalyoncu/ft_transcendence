<template>
  <div class="friend-request-item">
    <div class="friend-info" @click="viewProfile">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-username">{{ username }}</p>
    </div>
    <div class="request-actions">
      <button
        v-if="showAcceptRequest"
        class="icon-button-accept"
        @click="acceptFriendRequest"
        title="Accept"
      >
        <font-awesome-icon :icon="['fas', 'check']" />
      </button>
      <button
        v-if="showRejectRequest"
        class="icon-button-reject"
        @click="rejectFriendRequest"
        title="Reject"
      >
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
      <button class="icon-button-view-profile" @click="viewProfile" title="View Profile">
        <font-awesome-icon :icon="['fas', 'eye']" />
      </button>
      <button v-if="showBlockUser" class="icon-button-block" @click="blockUser" title="Block">
        <font-awesome-icon :icon="['fas', 'ban']" />
      </button>
      <button
        v-if="showUnblockUser"
        class="icon-button-unblock"
        @click="unblockUser"
        title="Unblock"
      >
        <font-awesome-icon :icon="['fas', 'fa-unlock']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useNotificationStore } from '../../stores/notification'
import type { FriendshipI } from '../../model/friendship/friendship.interface'
import type { ErrorI } from '../../model/error.interface'

library.add(fas)
const router = useRouter()
const notificationStore = useNotificationStore()

const emit = defineEmits(['reject-request', 'accept-request', 'block-user', 'unblock-user'])

const props = defineProps({
  username: String,
  requestId: Number,
  showAcceptRequest: Boolean,
  showRejectRequest: Boolean,
  showUnblockUser: Boolean,
  showBlockUser: Boolean
})

const viewProfile = () => {
  router.push(`/profile/${props.username}`)
}

const acceptFriendRequest = () => {
  emit('accept-request', props.requestId, props.username)
}

const rejectFriendRequest = () => {
  emit('reject-request', props.requestId, props.username)
}

const blockUser = () => {
  emit('block-user', props.requestId, props.username)
}

const unblockUser = () => {
  emit('unblock-user', props.requestId, props.username)
}
</script>

<style>
.friend-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid aliceblue;
  padding: 0.5rem 1rem;
  min-width: 540px;
  margin: 0 0 0.5rem 0;
}

.friend-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.friend-username {
  margin-left: 0.5rem;
  color: #ea9f42;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.icon-button-accept,
.icon-button-reject,
.icon-button-view-profile,
.icon-button-block,
.icon-button-unblock {
  background: none;
  border: none;
  cursor: pointer;
  color: #e47264;
  padding: 5px;
}

.icon-button-accept {
  color: green;
}

.icon-button-reject {
  color: red;
}

.icon-button-block {
  color: #a83232;
}

.icon-button-view-profile {
  color: aliceblue;
}

.icon-button-unblock {
  color: green;
}
</style>
