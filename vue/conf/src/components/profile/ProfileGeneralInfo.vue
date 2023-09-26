<template>
  <section class="general-info">
    <div class="profile-section">
      <img v-if="userAvatar" class="profile-image" :src="avatarSrc" alt="Profile" />
      <img v-else class="profile-image" src="../../assets/defaultAvatar.png" alt="Profile" />
      <span class="header-username profile-username">{{ username }}</span>
    </div>
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-number">3</span>
        <span class="stat-text stat-wins">Victories</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">1</span>
        <span class="stat-text stat-losses">Defeats</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { defineProps, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'

const props = defineProps({
  username: String
})

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const userAvatar = computed(() => userStore.avatarImageData)

const avatarSrc = computed(() => {
  if (userAvatar.value === null) {
    return ''
  }
  return URL.createObjectURL(userAvatar.value)
})

onMounted(async () => {
  try {
    await userStore.mountStore()
  } catch (error) {
    notificationStore.showNotification(
      "We're sorry, but it seems there was an issue initializing your user data. Please sign out and try logging in again. If the problem persists, please get in touch with a site administrator for assistance.",
      false
    )
    return
  }
})
</script>

<style>
.general-info {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 0 -1.5rem 1rem -1.5rem;
  border-bottom: 0.1px solid darkgray;
  padding: 0 1.5rem 0.5rem 1.5rem;
}

.profile-section {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.profile-username {
  font-size: 1.5rem;
  font-family: 'Gill Sans', sans-serif;
  text-transform: uppercase;
  margin-left: 1rem;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  width: 325px;
  padding: 0.25rem 0;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 3.5rem;
  color: aliceblue;
  font-family: 'Gill Sans', sans-serif;
}

.stat-text {
  font-size: 1.5rem;
  font-family: 'Gill Sans', sans-serif;
  text-transform: uppercase;
}

.stat-wins {
  color: green;
}

.stat-losses {
  color: #e2411f;
}
</style>
