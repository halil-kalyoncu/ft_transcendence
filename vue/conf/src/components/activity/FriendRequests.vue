<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-if="friendRequests && friendRequests.length">
        <div v-for="request in friendRequests" :key="request.id">
          <FriendRequestsItem
            v-if="isValidRequest(request)"
            :username="request.friend.username"
            :requestId="request.id"
            @remove-friend-request="handleRemoveFriendRequest"
          />
        </div>
      </div>
      <div v-else>
        <p class="empty-list-info">No Pending Friend Requests</p>
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FriendRequestsItem from './FriendRequestsItem.vue'

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

const handleRemoveFriendRequest = (requestId: number) => {
  friendRequestStore.removeFriendRequestById(requestId)
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
