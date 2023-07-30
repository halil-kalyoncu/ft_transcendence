<template>
    <h2 class="current-channel-name">Channel Name</h2>

  <ScrollViewer :maxHeight="'35vh'" :paddingRight="'.5rem'">
    <div v-for="(user, index) in dummyUserData" :key="index">
      <ChannelManagerUserItem :username="user.username" :date="user.date" :roleProp="user.role" :currentUserRole="currentUserRole"  />
    </div>
  </ScrollViewer>
  <div class="channel-manager-info">
    <button v-show="currentUserRole === 'owner'" class="join-channel-button" :class="'change-password'"> Change Password </button>
    <button class="join-channel-button"> Leave </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChannelManagerUserItem from './ChannelManagerUserItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useUserStore } from '../../stores/username'

const userStore = useUserStore()
const username = computed(() => userStore.username)
const props = defineProps({
  channelId: Number
})

type User = {
  username: string;
  date: string;
  role: string;
};

const roles = ['owner', 'admin', 'member'];

const getRandomRole = () => roles[Math.floor(Math.random() * roles.length)];

const dummyUserData: User[] = Array.from({ length: 10 }, (_, i) => ({
  username: `Thomas ${i + 1}`,
  date: `2023-07-21`,
  role: getRandomRole()
}));

const currentUser = computed(() => dummyUserData.find(user => user.username === username.value));
// todo: compute currentUserRole instead of static when backend is in place
// const currentUserRole = computed(() => currentUser.value ? currentUser.value.role : 'member');
const currentUserRole = 'owner';

</script>

<style>
.current-channel-name {
  text-align: center;
  font-size: 1.25rem;
  margin: -1rem 0 0 0;
  font-family: 'Courier New', Courier, monospace !important;
  color: #ea9f42;
}

.channel-manager-info{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: .5rem 0 .5rem 0;
}

.channel-manager-info .join-channel-button{
  background-color: red;
  border: none;
  transition: opacity .25s ease-out;
}

.channel-manager-info .join-channel-button:hover{
  background-color: red;
  border: none;
  opacity: 0.75;
}

.change-password{
  background-color: green !important;
}

</style>
