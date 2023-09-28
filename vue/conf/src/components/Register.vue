<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { onMounted, ref } from 'vue'

const route = useRoute()
const intraLogin = route.params.intraLogin as string
const notificationStore = useNotificationStore()
const router = useRouter()

const username = ref('')

const fetchCanBeRegistered = async () => {
  try {
    console.log(intraLogin)
    const response = await fetch(
      `http://localhost:3000/api/users/canBeRegistered?intraLogin=${intraLogin}`
    )

    const responseData = await response.json()
    if (!response.ok || !responseData) {
      notificationStore.showNotification('Something went wrong', false)
      router.push('/')
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong', false)
    router.push('/')
  }
}

const submitForm = async () => {
  try {
    console.log(username)
    const response = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value, intraLogin })
    })

    const responseData = await response.text()
    username.value = ''
    if (response.ok) {
      notificationStore.showNotification('Successfully registered', true)
      router.push(`/validateToken/${responseData}`)
    } else {
      notificationStore.showNotification('Error occurred during registration', false)
    }
  } catch (error) {
    username.value = ''
    notificationStore.showNotification('Something went wrong during registration', false)
  }
}

onMounted(async () => {
  await fetchCanBeRegistered()
})
</script>
<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="username">Username:</label>
      <input type="text" id="username" v-model="username" required />
      <button type="submit" role="link">register</button>
    </form>
  </div>
</template>
