<template>
  <h2 class="current-channel-name">Channel Name</h2>
  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
    <div v-for="(user, index) in dummyUserData" :key="index">
      <ChannelManagerUserItem :username="user.username" :date="user.date" />
    </div>
  </ScrollViewer>
</template>

<script setup lang="ts">
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'

const props = defineProps({
  channelId: Number
})

const dummyUserData = Array(9)
  .fill()
  .map((_, i) => ({
    username: `Thomas ${i + 1}`,
    date: `2023-07-2${i}`
  }))
</script>

<style>
.current-channel-name {
  text-align: center;
  font-size: 1.25rem;
  margin: -0.5rem 0 1rem 0;
  font-family: 'Courier New', Courier, monospace !important;
  color: #428dea;
}
</style>
