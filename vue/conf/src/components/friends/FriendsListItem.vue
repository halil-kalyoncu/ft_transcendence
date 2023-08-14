<template>
  <div class="friend-list-item">
    <div class="friend-container">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-name">{{ username }}</p>
    </div>
    <div class="friends-actions-container">
      <div v-if="showActions">
        <button class="action-button-ban" @click="unfriendUser" title="Unfriend">
          <font-awesome-icon :icon="['fas', 'fa-user-times']" />
        </button>
        <button class="action-button-ban" @click="banUser" title="Ban">
          <font-awesome-icon :icon="['fas', 'ban']" />
        </button>
      </div>
      <div
        :title="status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'In Game'"
        class="statusIndicator"
        :class="{
          online: status === 'online',
          offline: status === 'offline',
          inGame: status === 'inGame'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
const router = useRouter()

const props = defineProps({
  username: String,
  status: String,
  showActions: Boolean
})

const emit = defineEmits(['handle-unfriend', 'handle-block'])

const unfriendUser = () => {
  emit('handle-unfriend')
}

const banUser = () => {
  emit('handle-block')
}
</script>

<style scoped>
.friend-list-item {
  cursor: auto !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid aliceblue;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0 0 0;
}

.friend-container {
  cursor: pointer;
  display: flex;
}

.friend-name {
  margin: 0;
  padding: 0;
  font-size: 0.8rem;
  color: #ea9f42;
  font-weight: bold;
}

.friend-container .icon {
  margin-right: 10px;
}

.friend-list-item .statusIndicator {
  text-align: center;
  height: 0.75rem;
  width: 0.75rem;
  margin: 1px 6px 2.5px 6px;
}

.friends-actions-container {
  display: flex;
  align-items: center;
}
</style>
