<template>
  <div class="joinned-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="(channel, index) in dummyChannelData" :key="index">
        <ChannelListItem
          :isPasswordProtected="false"
          :channelName="channel.channelName"
          :ownerName="username"
          :joinChannelButtonName="'Enter'"
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
    channelName: 'My Channel 1'
  },
  {
    channelName: 'My Channel 2'
  },
  {
    channelName: 'My Channel 3'
  },
  {
    channelName: 'My Channel 4'
  },
  {
    channelName: 'My Channel 5'
  },
  {
    channelName: 'My Channel 6'
  }
]

const props = defineProps({
  username: String
})
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
