<template>
  <div class="available-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="(channel, index) in dummyChannelData" :key="index">
        <ChannelListItem
          :isPasswordProtected="channel.isPasswordProtected"
          :channelName="channel.channelName"
          :ownerName="channel.ownerName"
          :joinChannelButtonName="'Join'"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import ScrollViewer from '../utils/ScrollViewer.vue'
import ChannelListItem from './ChannelListItem.vue'

const dummyChannelData = [
  {
    isPasswordProtected: true,
    channelName: 'Channel 1',
    ownerName: 'Max'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 2',
    ownerName: 'Halil'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 3',
    ownerName: 'Lorenz'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 4',
    ownerName: 'Ezra'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 5',
    ownerName: 'Vytautas'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 6',
    ownerName: 'Max'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 7',
    ownerName: 'Halil'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 8',
    ownerName: 'Lorenz'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 9',
    ownerName: 'Ezra'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 10',
    ownerName: 'Vytautas'
  }
]
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
