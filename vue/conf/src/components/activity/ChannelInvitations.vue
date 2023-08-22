<template>
  <div class="friend-requests">
    <ScrollViewer :maxHeight="'75vh'" :paddingRight="'.5rem'">
      <div v-for="(channel, index) in dummyUserData" :key="index">
        <ChannelInvitationsItem
          :username="channel.username"
          :channelName="channel.channelName"
          :isPasswordProtected="channel.isPasswordProtected"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ChannelInvitationsItem from './ChannelInvitationsItem.vue'

import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

type ChannelInvitation = {
  username: string
  channelName: string
  isPasswordProtected: boolean
}

const dummyUserData: ChannelInvitation[] = Array.from({ length: 8 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  channelName: `Channel ${i + 1}`,
  isPasswordProtected: Math.random() < 0.5
}))
</script>

<style></style>
