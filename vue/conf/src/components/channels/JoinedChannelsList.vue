<template>
	<div class="joinned-channels">
	  <ScrollViewer :maxHeight="'82.5vh'" :paddingRight="'.5rem'">
		<div v-for="channel in channelData" :key="channel.channel.id">
		  <ChannelListItem
			:isPasswordProtected="channel.channel.protected"
			:channelName="channel.channel.name"
			:ownerName="channel.owner.username"
			:joinChannelButtonName="'Enter'"
			:channelId="channel.channel.id"
			@channelEntered="handleChannelEntered(channel.channel.id)"
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
  import type {ChannelEntryI} from  '../../model/channels/createChannel.interface'
  import { useNotificationStore } from '../../stores/notification'
  
  //How to use this? 
  const emit = defineEmits(['channel-entered'])
  const handleChannelEntered = (channelId: number) => {
	emit('channel-entered', channelId)
  }
  

  //const channelData = ref([]); //
  const channelData = ref<ChannelEntryI[]>([])
  onMounted(async () => {
	  
  const userStore = useUserStore()
  const userId = computed(() => userStore.userId)
  const notificationStore = useNotificationStore()
  const role = 'all'  
	try{
		const response =  await fetch(`http://localhost:3000/api/channel/getAllChannelsFromUser?userId=${userId.value}&role=${role}`)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json()
		channelData.value = data;
		console.log('Channel data: ')
		//TODO take this out
		for (const channel of channelData.value) {
			console.log(channel)
		}
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
  