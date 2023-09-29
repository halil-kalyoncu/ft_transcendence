<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'

const route = useRoute()
const intraLogin = route.params.intraLogin as string
const notificationStore = useNotificationStore()
const router = useRouter()

const username = ref('')
const avatarInput: Ref<HTMLInputElement | null> = ref(null)
const avatarSelected = ref<boolean>(false)

const fetchCanBeRegistered = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_BACKENDPORT}/api/users/canBeRegistered?intraLogin=${intraLogin}`
    )

	console.log(response);
    const responseData = await response.json()
	console.log(responseData);
    if (!response.ok || !responseData) {
      notificationStore.showNotification('Something went wrong', false)
      router.push('/')
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong', false)
    router.push('/')
  }
}

const fileSelected = () => {
	avatarSelected.value = true
}

const removeAvatarInput = () => {
	if (!avatarInput.value) {
		return 
	}

	avatarInput.value.value = ''
	avatarSelected.value = false
}

const handleRegisterWithoutAvatar = async () => {
  try {
    const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_BACKENDPORT}/api/users/register`, {
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

const handleRegisterWithAvatar = async () => {
	if (!avatarInput.value || !avatarInput.value.files || !avatarInput.value.files.length) {
		return 
	}
	try {
		const formData = new FormData()
		formData.append('file', avatarInput.value.files[0])
		formData.append('username', username.value)
		formData.append('intraLogin', intraLogin)

		const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_BACKENDPORT}/api/users/registerWithAvatar`, {
			method: 'POST',
			body: formData
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

const submitForm = async () => {
  if (!avatarInput.value) {
	return
  }

  if (!avatarInput.value.value) {
    await handleRegisterWithoutAvatar()
  } else {
    await handleRegisterWithAvatar()
  }
}

onMounted(async () => {
  await fetchCanBeRegistered()
})
</script>

<template>
  <div>
    <form @submit.prevent="submitForm">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="avatar">Choose Avatar (optional)</label>
        <input type="file" id="avatar" ref="avatarInput" @change="fileSelected"/>
      </div>
	  <button v-if="avatarSelected" @click="removeAvatarInput">unselect</button>
      <button type="submit" role="link">register</button>
    </form>
  </div>
</template>
