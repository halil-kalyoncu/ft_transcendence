<script setup lang="ts">
import GameInvites from './GameInvites.vue'
import FriendRequests from './FriendRequests.vue'
import ChannelInvitations from './ChannelInvitations.vue'
import BlockedUsers from './BlockedUsers.vue'
import { ref, onMounted } from 'vue'

const activePanel = ref('GameInvites')

const setActivePanel = (value: string) => {
  activePanel.value = value
}
</script>
<template>
  <nav class="activityCenter">
    <ul>
      <li
        @click="setActivePanel('GameInvites')"
        class="navButton"
        :class="{ selected: activePanel === 'GameInvites' }"
      >
        Game Invites
      </li>
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
    <GameInvites v-show="activePanel === 'GameInvites'" />
    <FriendRequests v-show="activePanel === 'FriendRequests'" />
    <ChannelInvitations v-show="activePanel === 'ChannelInvitations'" />
    <BlockedUsers v-show="activePanel === 'BlockedUsers'" />
  </nav>
</template>

<style scoped>
.activityCenter {
  width: 100%;
  height: calc(100vh - 50.8px);

  background: rgba(0, 0, 0, 0.6);

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
