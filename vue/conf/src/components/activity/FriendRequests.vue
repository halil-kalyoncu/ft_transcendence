<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-for="(user, index) in dummyUserData" :key="index">
        <FriendRequestsItem :username="user.username" />
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

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

type User = {
  username: string
}

const dummyUserData: User[] = Array.from({ length: 7 }, (_, i) => ({
  username: `Thomas ${i + 1}`
}))
</script>

<style>
.friend-requests {
  padding: 1.5rem 0 0 0;
}
</style>