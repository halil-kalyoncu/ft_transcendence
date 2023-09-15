<script setup lang="ts">
import type { directMessageI } from '../../model/message/directMessage.interface'
import type { UserI } from '../../model/user.interface'
import type { MessageI } from '../../model/message/message.interface'

const props = defineProps({
  sender: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: false
  },
  isOwnMessage: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  blockedGroupMessage: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div v-if="blockedGroupMessage" class="message">
    <p class="message-content"> Blocked message from {{ sender }}</p>
  </div>
  <div v-else class="message" :class="{ 'own-message': isOwnMessage }">
    <span class="message-sender">{{ sender }}</span>
    <small class="message-date">{{ createdAt }}</small>
    <p class="message-content">{{ message }}</p>
  </div>
</template>

<style>
.message {
  width: 85%;
  padding: 0.25rem 0.5rem;
  margin: 0 0 0.5rem 0;
  border-radius: 0.1rem;
  line-height: 1.4;
  position: relative;
  font-size: 0.8em;
  background-color: #1a1a1a;
  border: 0.1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.own-message {
  align-self: flex-end;
}

.own-message::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border: 4px solid;
  border-color: #ea9f42 transparent transparent #ea9f42;
}

.message-sender {
  font-weight: bold;
  font-size: 0.9em;
  color: #ea9f42;
}

.message-date {
  color: lightgray;
  float: right;
  margin-left: 10px;
}

.message-content {
  clear: both;
  word-break: break-word;
  hyphens: auto;
}
</style>
