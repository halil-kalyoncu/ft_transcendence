<template>
  <div class="friend-list-item">
    <div class="friend-container">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-name">{{ username }}</p>
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
  status: String
})

console.log(status + ',,')
</script>

<style scoped>
.friend-list-item {
  cursor: auto !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0.5px solid aliceblue;
  padding: 0.5rem 1rem;
  margin: 1rem 0.5rem 0 0.5rem;
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
}
</style>
