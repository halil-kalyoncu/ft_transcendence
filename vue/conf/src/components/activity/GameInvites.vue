<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="friendRequests && friendRequests.length">
        <div v-for="request in friendRequests" :key="request.id">
          <RequestItem
            v-if="isValidRequest(request)"
            :username="request.friend.username"
            :requestId="request.id"
            :showAcceptRequest="true"
            :showRejectRequest="true"
            :showBlockUser="false"
            :showUnblockUser="false"
            @accept-request="handleAcceptGameRequest"
            @reject-request="handleRejectGameRequest"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">No Pending Game Requests</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RequestItem from './RequestItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'
import { useFriendRequestStore } from '../../stores/friendRequests'

const friendRequestStore = useFriendRequestStore()
const friendRequests = computed(() => friendRequestStore.friendRequests)

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

const isValidRequest = (request: any) => {
  return request && request.friend && request.friend.username
}

const handleAcceptGameRequest = (requestId: number, username: string) => {
  notificationStore.showNotification(`You accepted ${username}'s game request`, true)
}

const handleRejectGameRequest = (requestId: number, username: string) => {
  notificationStore.showNotification(`You rejected ${username}'s game request`, true)
}
</script>

<style>
.friend-requests {
  padding: 1.5rem 0 0 0;
}

.empty-list-info {
  color: lightgray;
}
</style>
