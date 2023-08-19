<script setup lang="ts">
import FriendRequests from './FriendRequests.vue'
import { ref, onMounted } from 'vue'

const activePanel = ref('FriendRequests')

const setActivePanel = (value: string) => {
  activePanel.value = value
}
</script>
<template>
  <nav class="activityCenter">
    <ul>
      <li
        @click="setActivePanel('FriendRequests')"
        class="navButton"
        :class="{ selected: activePanel === 'FriendRequests' }"
      >
        Friend Requests
      </li>
      <li
        @click="setActivePanel('ChannelInvitations')"
        class="navButton"
        :class="{ selected: activePanel === 'ChannelInvitations' }"
      >
        Channel Invitations
      </li>
      <li
        @click="setActivePanel('BlockedUsers')"
        class="navButton"
        :class="{ selected: activePanel === 'BlockedUsers' }"
      >
        Blocked Users
      </li>
    </ul>
    <FriendRequests v-show="activePanel === 'FriendRequests'" />
    <FriendRequests v-show="activePanel === 'ChannelInvitations'" />
    <FriendRequests v-show="activePanel === 'BlockedUsers'" />
  </nav>
</template>


<style scoped>
.activityCenter {
  width: 100%;
  height: calc(100vh - 50.8px);
  background-color: #171717;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  align-items: center;
}

.activityCenter ul {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}
</style>
