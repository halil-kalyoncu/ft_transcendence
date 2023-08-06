<template>
  <div class="chat-component">
    <!-- <FriendMessages v-if="displayMode === 'friends'" /> -->
    <ChannelMessages v-if="displayMode === 'channel'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FriendMessages from './FriendMessages.vue'
import ChannelMessages from './ChannelMessages.vue'

const props = defineProps({
  displayMode: String
})

const messageToSend = ref('')
</script>

<style scoped>
.chat-input {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  position: relative;
}

.chat-input textarea {
  width: 100%;
  padding: 0.5rem 0.25rem;
  background-color: lightgray;
  border-radius: 0.25rem;
  resize: none;
}

.chat-input textarea:focus {
  outline: solid 2px #ea9f42;
}

.chat-input button {
  background-color: #ea9f42;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: 0.3s;
}

.chat-input button:hover {
  background-color: #ed901c;
}
</style>
