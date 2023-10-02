<template>
  <section class="general-info">
    <div class="profile-section">
      <img v-if="userAvatar" class="profile-image" :src="avatarSrc" alt="Profile" />
      <img v-else class="profile-image" src="../../assets/defaultAvatar.png" alt="Profile" />
      <span class="header-username profile-username">{{ userName }}</span>
    </div>
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-number">{{ wins }}</span>
        <span class="stat-text stat-wins">Victories</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ losses }}</span>
        <span class="stat-text stat-losses">Defeats</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '../../stores/userInfo'
import { useNotificationStore } from '../../stores/notification'

const props = defineProps({
  userid: String,
  username: String,
  wins: Number,
  losses: Number
})

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const avatarImageData = ref<Blob | null>(null)
const avatarSrc = ref('')
const userAvatar = ref(false)
const userName = computed(() => props.username)

const setAvatar = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/avatar/${props.userid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      }
    })
    if (!response.ok) {
      userAvatar.value = false
      return
    }

    avatarImageData.value = await response.blob()
    avatarSrc.value = URL.createObjectURL(avatarImageData.value)
    userAvatar.value = true
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching the user avatar', false)
    userAvatar.value = false
  }
}

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
  await setAvatar()
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
