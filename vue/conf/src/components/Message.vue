<script setup lang="ts">
import type { directMessageI } from '../model/directMessage.interface'
import type { UserI } from '../model/user.interface'
import type { MessageI } from '../model/message.interface'

const props = defineProps({
  directMessage: {
    type: Object as () => directMessageI,
    required: true
  }
})

const sender: UserI = props.directMessage.sender
const message: MessageI = props.directMessage.message
</script>

<template>
  <div class="message">
    <span class="message-sender">{{ sender.username }}</span>
    <p class="message-content">{{ message.message }}</p>
  </div>
</template>

<style>
.message {
  margin: 5px 0;
}

.message-sender {
  font-weight: bold;
}

.message-content {
  margin: 0;
}
</style>
