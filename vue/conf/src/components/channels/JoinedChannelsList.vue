<template>
  <div class="joinned-channels">
    <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="(channel, index) in dummyChannelData" :key="index">
        <ChannelListItem
          :isPasswordProtected="false"
          :channelName="channel.channelName"
          :ownerName="channel.ownerName"
          :joinChannelButtonName="'Enter'"
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
    channelId: 1,
    channelName: 'My Channel 1',
    ownerName: 'Halil'
  },
  {
    channelId: 2,
    ownerName: 'Max',
    channelName: 'My Channel 2'
  },
  {
    channelId: 3,
    channelName: 'My Channel 3',
    ownerName: 'Ezra'
  },
  {
    channelId: 4,
    channelName: 'My Channel 4',
    ownerName: 'Vytautas'
  },
  {
    channelId: 5,
    channelName: 'My Channel 5',
    ownerName: 'Leo'
  },
  {
    channelId: 6,
    channelName: 'My Channel 6',
    ownerName: 'Thomas'
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
