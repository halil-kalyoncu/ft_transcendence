<template>
  <div class="available-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="(channel, index) in dummyChannelData" :key="index">
        <ChannelListItem
          :isPasswordProtected="channel.isPasswordProtected"
          :channelName="channel.channelName"
          :ownerName="channel.ownerName"
          :joinChannelButtonName="'Join'"
          :channelId="channel.channelId"
          @channel-entered="handleChannelEntered"
        />
      </div>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import ScrollViewer from '../utils/ScrollViewer.vue'
import ChannelListItem from './ChannelListItem.vue'

const emit = defineEmits(['channel-entered'])
const handleChannelEntered = (channelId: number) => {
  emit('channel-entered', channelId)
}

const dummyChannelData = [
  {
    isPasswordProtected: true,
    channelName: 'Channel 1',
    channelId: 1,
    ownerName: 'Max'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 2',
    channelId: 2,
    ownerName: 'Halil'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 3',
    channelId: 3,
    ownerName: 'Leo'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 4',
    channelId: 4,
    ownerName: 'Ezra'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 5',
    channelId: 5,
    ownerName: 'Vytautas'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 6',
    channelId: 6,
    ownerName: 'Max'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 7',
    channelId: 7,
    ownerName: 'Halil'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 8',
    channelId: 8,
    ownerName: 'Leo'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 9',
    channelId: 9,
    ownerName: 'Ezra'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 10',
    channelId: 10,
    ownerName: 'Vytautas'
  }
]
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
