<template>
  <div
    v-if="notification.show"
    class="error-notification"
    :class="{ success: notification.success, error: !notification.success }"
  >
    {{ notification.message }}
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../stores/notification'

const notification = useNotificationStore()
</script>

<style>
.error-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
  color: white;
  text-align: center;
  z-index: 1000;
  transition: 0.25s all ease-out;
}

.error-notification.error {
  background-color: #e2411f;
  opacity: 0.9;
  margin-top: 0 !important;
}

.error-notification.success {
  background-color: green;
  opacity: 0.9;
}
</style>
