<template>
  <div class="friend-list-item">
    <div class="friend-container" @click="goToProfile">
      <font-awesome-icon class="icon" :icon="['fas', 'user']" />
      <p class="friend-name" :title="username">{{ username }}</p>
      <div class="icon-container">
        <font-awesome-icon
          :icon="['fas', 'envelope']"
          class="envelope-icon"
          v-if="unreadMessagesAmount && unreadMessagesAmount > 0"
        />
        <span v-if="unreadMessagesAmount && unreadMessagesAmount > 0" class="badge-number">{{
          unreadMessagesAmount
        }}</span>
      </div>
    </div>
    <div class="friends-actions-container">
      <div v-if="showActions">
        <button class="action-button-ban" @click="unfriendUser" title="Unfriend">
          <font-awesome-icon :icon="['fas', 'fa-user-times']" />
        </button>
        <button v-if="!blocked" class="action-button-ban" @click="blockUser" title="Block">
          <font-awesome-icon :icon="['fas', 'ban']" />
        </button>
        <button v-else class="action-button-unban" @click="unblockUser" title="Unblock">
          <font-awesome-icon :icon="['fas', 'ban']" />
        </button>
      </div>
      <div
        :title="status"
        class="statusIndicator"
        :class="{
          online: status === 'ONLINE',
          offline: status === 'OFFLINE',
          inGame: status === 'INGAME'
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
  blocked: Boolean,
  unreadMessagesAmount: Number,
  showActions: Boolean,
  userid: Number
})

const emit = defineEmits(['handle-unfriend', 'handle-block', 'handle-unblock'])

const unfriendUser = () => {
  emit('handle-unfriend')
}

const blockUser = () => {
  emit('handle-block')
}

const unblockUser = () => {
  emit('handle-unblock')
}

const goToProfile = () => {
  if (props.userid) {
    router.push(`/profile/${props.userid}`)
  }
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
  justify-content: space-between;
  align-items: center;
}

.friend-name {
  margin: 0;
  padding: 0;
  font-size: 0.8rem;
  color: #ea9f42;
  font-weight: bold;
  max-width: 120px;
  height: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-container .icon {
  margin: 0.5rem;
  width: 0.75rem;
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

.icon-container {
  position: relative;
  display: inline-block;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0.5rem;
}

.badge-number {
  position: absolute;
  bottom: 0.3rem;
  left: 100%;
  transform: translate(-50%, 50%);
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 0.65rem;
  height: 0.65rem;
  line-height: 0.65rem;
  text-align: center;
  font-size: 0.55rem;
  font-weight: bold;
}

.envelope-icon {
  width: 100%;
}
</style>
