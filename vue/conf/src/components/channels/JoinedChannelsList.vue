<template>
	<div class="joinned-channels">
	  <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
		<div v-for="channel in channelData" :key="channel.channel.id">
		  <ChannelListItem
			:isPasswordProtected="channel.channel.protected"
			:channelName="channel.channel.name"
			:ownerName="channel.owner.username"
		  />
		</div>
	  </ScrollViewer>
	</div>
  </template>
  
  <script setup lang="ts">
  import ScrollViewer from '../utils/ScrollViewer.vue'
  import ChannelListItem from './ChannelListItem.vue'
  import { onMounted, computed, ref} from 'vue'
  import { useUserStore } from '../../stores/userInfo'
  import type {ChannelInfoI} from  '../../model/channels/createChannel.interface'
  import { useNotificationStore } from '../../stores/notification'
  
  //How to use this? 
  const emit = defineEmits(['channel-entered'])
  const handleChannelEntered = (channelId: number) => {
	emit('channel-entered', channelId)
  }
  
  const channelData = ref<ChannelInfoI[]>([])
  const userStore = useUserStore()
  const userId = computed(() => userStore.userId)
  const notificationStore = useNotificationStore()
  
  onMounted(async () => {
	  try{
		console.log("USER")
	console.log(userId)
		const response =  await fetch(`http://localhost:3000/api/channel/getAllChannelsFromUser?userId=${userId.value}`)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json()
	  	channelData.value = data
	  }
	  catch (error: any) {
	  notificationStore.showNotification(`Error` + error.message, true)
	}
	  }
  )
  </script>
  
  <style>
  .available-channels {
	height: calc(100% - 50px);
  }
  </style>
  