<template>
  <h2 class="current-channel-name">Channel Name</h2>
  <ChannelManagerUserItem username="John Doe" date="2023-07-28" />
</template>

<script setup lang="ts">
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'

const props = defineProps({
  channelId: Number
})
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
