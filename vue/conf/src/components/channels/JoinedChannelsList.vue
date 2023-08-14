<template>
  <div class="joinned-channels">
    <!-- <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
      <div v-for="channel in channelData" :key="channel.channel.id">
        <ChannelListItem
          :isPasswordProtected="channel.channel.protected"
          :channelName="channel.channel.name"
          :ownerName="channel.owner.name"
          :joinChannelButtonName="'Enter'"
          @channel-entered="handleChannelEntered(channel.channel.id)"
        />
      </div>
    </ScrollViewer> -->
  </div>
</template>

<script setup lang="ts">
import ScrollViewer from '../utils/ScrollViewer.vue'
import ChannelListItem from './ChannelListItem.vue'
import { onMounted, computed, ref} from 'vue'
import { useUserStore } from '../../stores/userInfo'
import type {ChannelInfoI} from  '../../model/channels/createChannel.interface'

const emit = defineEmits(['channel-entered'])
const handleChannelEntered = (channelId: number) => {
  emit('channel-entered', channelId)
}

const channelData = ref<ChannelInfoI[]>([])
const userStore = useUserStore()
const userId = computed(() => userStore.userId)

onMounted(async () => {
  try {
    const response = await fetch(`/api/getAllChannelsFromUser?userId=${userId}`)
	if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    channelData.value = data
  } catch (error) {
    console.error('Error fetching user channels:', error)
  }
})
</script>

<style>
.available-channels {
  height: calc(100% - 50px);
}
</style>
