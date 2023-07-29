<script setup lang="ts">
import Channels from '../channels/Channels.vue'
import Friends from '../friends/Friends.vue'
import { ref, onMounted } from 'vue'

let showFriendsSideBar = ref(true)

const setFriendsVisible = (value: boolean) => {
  showFriendsSideBar.value = value
}
</script>

<template>
  <nav class="sideBar">
    <ul>
      <li
        @click="() => setFriendsVisible(true)"
        class="navButton"
        :class="{ selected: showFriendsSideBar }"
      >
        Friends
      </li>
      <li
        @click="() => setFriendsVisible(false)"
        class="navButton"
        :class="{ selected: !showFriendsSideBar }"
      >
        Channels
      </li>
    </ul>
    <Friends v-show="showFriendsSideBar" />
    <Channels v-show="!showFriendsSideBar" />
  </nav>
</template>

<style>
.sideBar {
  width: 300px;
  min-width: 300px;
  background-color: #0d1117;
  padding: 0 0.5rem;
  border-right: 0.25px solid darkgray;
}

.sideBar ul {
  list-style: none;
  display: flex;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}

.navButton {
  padding: 0.5rem;
  font-size: 1.125rem;
  color: #747c86;
  cursor: pointer;
  transition: 0.2s color ease-out;
}

.navButton:hover {
  color: #f7d8b2;
}

.selected {
  color: #e6edf3;
  border-bottom: 2px solid #ea9f42;
}

.selected:hover {
  color: #e6edf3;
}
</style>
