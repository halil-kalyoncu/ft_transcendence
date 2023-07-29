<script setup lang="ts">
import type { directMessageI } from '../../model/directMessage.interface'
import type { UserI } from '../../model/user.interface'
import type { MessageI } from '../../model/message.interface'

const props = defineProps({
  directMessage: {
    type: Object as () => directMessageI,
    required: true
  },
  isOwnMessage: {
    type: Boolean,
    required: true
  }
})

const sender: UserI = props.directMessage.sender
const message: MessageI = props.directMessage.message
</script>

<template>
  <div class="message" :class="{ 'own-message': isOwnMessage }">
    <span class="message-sender">{{ sender.username }}</span>
    <small class="message-date">{{ message.createdAt }}</small>
    <p class="message-content">{{ message.message }}</p>
  </div>
</template>

<style>
.message {
  margin: 5px 0;
  padding: 5px;
  border-radius: 5px;
  width: 48%;
  background-color: white;
  color: black;
}

.message-sender {
  font-weight: bold;
}

.message-content {
  margin: 0;
}

.own-message {
  background-color: blue;
  color: white;
  align-self: flex-end;
}

.message-date {
  font-size: 0.7em;
  margin-left: 5px;
}
</style>
