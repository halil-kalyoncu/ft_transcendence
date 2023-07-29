<template>
  <div class="available-channels">
    <ScrollViewer :maxHeight="'80vh'" :paddingRight="'.5rem'">
    <div v-for="(channel, index) in dummyChannelData" :key="index">
      <ChannelListItem
        :isPasswordProtected="channel.isPasswordProtected"
        :channelName="channel.channelName"
        :ownerName="channel.ownerName"
        :joinChannelButtonName="channel.joinChannelButtonName"
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
    ownerName: 'Max',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 2',
    ownerName: 'Halil',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 3',
    ownerName: 'Lorenz',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 4',
    ownerName: 'Ezra',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 5',
    ownerName: 'Vytautas',
    joinChannelButtonName: 'Join'
  },
    {
    isPasswordProtected: true,
    channelName: 'Channel 6',
    ownerName: 'Max',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 7',
    ownerName: 'Halil',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 8',
    ownerName: 'Lorenz',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: false,
    channelName: 'Channel 9',
    ownerName: 'Ezra',
    joinChannelButtonName: 'Join'
  },
  {
    isPasswordProtected: true,
    channelName: 'Channel 10',
    ownerName: 'Vytautas',
    joinChannelButtonName: 'Join'
  }
]
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
  margin: 0 -1rem 0 0;
}

</style>
