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
const selectedAvatarName = ref('')
const avatarInput: Ref<HTMLInputElement | null> = ref(null)
const avatarSelected = ref<boolean>(false)

const fetchCanBeRegistered = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/canBeRegistered?intraLogin=${intraLogin}`
    )

    console.log(response)
    const responseData = await response.json()
    console.log(responseData)
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
  if (avatarInput.value && avatarInput.value.files && avatarInput.value.files.length) {
    selectedAvatarName.value = avatarInput.value.files[0].name
    avatarSelected.value = true
  }
}

const removeAvatarInput = () => {
  if (!avatarInput.value) {
    return
  }
  avatarInput.value.value = ''
  selectedAvatarName.value = ''
  avatarSelected.value = false
}

const handleRegisterWithoutAvatar = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.value, intraLogin })
      }
    )

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

    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/registerWithAvatar`,
      {
        method: 'POST',
        body: formData
      }
    )

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
  <div class="register">
    <form @submit.prevent="submitForm">
      <div class="input-group">
        <input type="text" id="username" v-model="username" placeholder="Enter username" required />
      </div>
      <div class="input-group">
        <div class="file-upload-wrapper">
          <label for="avatar" class="secondary-btn upload-btn">
            <span v-if="selectedAvatarName.length">{{ selectedAvatarName }}</span>
            <span v-else>Choose Avatar (optional)</span>
          </label>
          <input
            class="file-input"
            type="file"
            id="avatar"
            ref="avatarInput"
            @change="fileSelected"
          />
        </div>
      </div>
      <div class="input-group" v-if="avatarSelected">
        <button class="secondary-btn" @click="removeAvatarInput">Delete Avatar</button>
      </div>
      <button type="submit" role="link" class="dynamic-button" :class="'margin-left'">
        Register
      </button>
    </form>
  </div>
</template>

<style scoped>
.margin-left {
  margin-left: 0.25rem;
}

.register {
  background-color: transparent;
  width: 100vw;
  height: 100vh;
  position: relative;
  background: rgba(0, 0, 0, 0.7) !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10% 0 0 22.5%;
}

.input-group input[type='text'] {
  padding: 0.5rem 1rem;
  margin-left: 0.25rem;
  min-height: 40px;
  border: none;
  min-width: 540px;
  background-color: transparent;
  border: 1px solid aliceblue;
  opacity: 0.9;
  color: #fff;
  font-family: 'Courier New', Courier, monospace !important;
}

.input-group input[type='text']::placeholder {
  text-align: center;
  color: aliceblue;
  font-size: 15px;
}

.input-group {
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.input-group .secondary-btn.upload-btn {
  background: transparent;
  margin-left: 0.25rem;
  min-width: 540px;
  max-width: 100%;
  border: 1px solid aliceblue;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-group .secondary-btn.upload-btn span {
  max-width: 500px;
  text-overflow: ellipsis;
}

.input-group .input[type='text']:hover,
.input-group .secondary-btn:hover,
.input-group .secondary-btn.confirm-button:hover,
.input-group .secondary-btn.upload-btn:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}

.input-group input[type='text']:focus,
.input-group input[type='file']:focus,
.input-group .secondary-btn:focus {
  outline: solid 1px #ea9f42;
  border: none;
}

.input-group .secondary-btn {
  background: transparent;
  margin-left: 0.25rem;
  min-width: 540px;
  border: 1px solid aliceblue;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  text-align: center;
  color: aliceblue;
  font-size: 15px;
  font-family: 'Courier New', Courier, monospace !important;
  min-height: 40px;
  transition: all 0.25s ease;
}

.input-group .secondary-btn:active {
  background-color: #ea9f42;
  border: none;
  color: #ffffff;
}

.input-group .file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  clip: rect(0, 0, 0, 0);
}


</style>
