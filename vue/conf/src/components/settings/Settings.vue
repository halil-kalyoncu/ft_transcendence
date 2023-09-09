<template>
  <div class="settings-container">
    <h2 class="page-title">User Settings</h2>

    <div class="input-group">
      <input type="text" id="username" placeholder="Enter username" v-model="username" />
    </div>

    <div class="input-group">
      <div class="file-upload-wrapper">
        <label for="avatar" class="secondary-btn upload-btn">
          {{ selectedFileName || 'Choose Avatar' }}
        </label>
        <input
          class="file-input"
          type="file"
          id="avatar"
          ref="avatarInput"
          @change="handleAvatarUpload"
        />
      </div>
    </div>

    <div class="input-group">
      <button class="secondary-btn" @click="deleteAvatar">Delete Avatar</button>
    </div>

    <div class="input-group">
      <button class="secondary-btn" :class="{enabled2FA : is2FAEnabled}" @click="toggle2FA">{{is2FAEnabled ? 'Disable 2FA': 'Enable 2FA'}}</button>
    </div>

    <div class="button-group">
      <button @click="deleteAccount" class="delete-button secondary-btn">Delete Account</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'
import { fetchAndSaveAvatar } from '../../utils/fetchAndSaveAvatar'

const notificationStore = useNotificationStore()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const username = ref('')
const enable2FA = ref(false)
const is2FAEnabled = ref(true)
const avatarInput: Ref<HTMLInputElement | null> = ref(null)
const uploadedAvatarFile: Ref<File | null> = ref(null)
const selectedFileName = ref('')
const images = ref([
  'src/assets/avatar-1.png',
  'src/assets/avatar-2.png',
  'src/assets/avatar-3.png',
  'src/assets/avatar-2.png'
])

const displayedCount = 3
const startIndex = ref(0)
const selectedImg = ref('src/assets/avatar-1.png')

const setSelectedImage = (img: string) => {
  selectedImg.value = img
}

const displayedImages = computed(() => {
  return images.value.slice(startIndex.value, startIndex.value + displayedCount)
})

const nextImages = () => {
  if (startIndex.value < images.value.length - displayedCount) {
    startIndex.value += displayedCount
  }
}

const previousImages = () => {
  if (startIndex.value >= displayedCount) {
    startIndex.value -= displayedCount
  }
}
const handleAvatarUpload = async () => {
  if (avatarInput.value && avatarInput.value.files && avatarInput.value.files.length) {
    selectedFileName.value = avatarInput.value.files[0].name
    uploadedAvatarFile.value = avatarInput.value.files[0]

    try {
      const formData = new FormData()
      formData.append('file', uploadedAvatarFile.value)

      const response = await fetch(
        `http://localhost:3000/api/users/avatar?userId=${userId.value}`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        notificationStore.showNotification('Success upload image', true)
        fetchAndSaveAvatar()
      } else {
        notificationStore.showNotification('Failed to upload image', false)
      }
    } catch (error: any) {
      notificationStore.showNotification(`Error` + error.message, false)
    }
  }
}

const deleteAvatar = async () => {
  avatarInput.value = null
  try {
    const response = await fetch(`http://localhost:3000/api/users/avatar?userId=${userId.value}`, {
      method: 'PATCH'
    })

    if (response.ok) {
      notificationStore.showNotification('Success delete avatar', true)
      userStore.clearAvatarImageData()
    } else {
      notificationStore.showNotification('Failed to delete avatar', false)
    }
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const deleteAccount = () => {
  const confirmDelete = window.confirm('Are you sure you want to delete your account?')
  if (confirmDelete) {
  }
}

const toggle2FA = () =>{
  is2FAEnabled.value = !is2FAEnabled.value;
}
</script>

<style scoped>
.settings-container {
  height: calc(100vh - 50.8px);
  width: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  box-sizing: border-box !important;
  background: rgba(0, 0, 0, 0.7);
}

.settings-container .username {
  font-size: 1.125rem;
  display: block;
}

.settings-container .username-input {
  display: block;
}

input[type='text'] {
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

input[type='text']::placeholder {
  text-align: center;
  color: aliceblue;
  font-size: 15px;
}

.page-title {
  text-align: left;
  margin: 0 0 1.25rem 0;
  min-width: 540px;
  font-size: 1.5rem;
  font-weight: normal;
  border-bottom: 1px solid #ea9f42;
  color: #ea9f42;
}

.input-group {
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.file-upload-wrapper {
  position: relative;
  display: inline-block;
}

.secondary-btn.upload-btn {
  background: transparent;
  margin-left: 0.25rem;
  min-width: 540px;
  border: 1px solid aliceblue;
  cursor: pointer;
  display: block;
}

.input[type='text']:hover,
.secondary-btn:hover,
.secondary-btn.upload-btn:hover,
.enabled2FA {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}

.enabled2FA{
    color: #ea9f42 !important;
}

input[type='text']:focus,
input[type='file']:focus,
.secondary-btn:focus {
  outline: solid 1px #ea9f42;
  border: none;
}

.secondary-btn {
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

.file-input {
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

.disabled {
  background-color: #2a2a2a;
  color: #555555;
  cursor: not-allowed;
  border: 1px solid #1a1a1a;
  pointer-events: none;
  opacity: 0.7;
}

.disabled:hover {
  background: #2a2a2a;
}

.delete-button {
  background-color: transparent;
  border: none;
  padding: 0.5rem 1rem;
  margin-left: 0.25rem;
  margin-top: -0.5rem;
  font-size: 15px;
  min-width: 540px;
  min-height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  background-color: #a83232;
  color: aliceblue;
  border-color: #ff3333;
}

.delete-button:hover {
  background-color: #ba4646;
  border: none;
}

.delete-button:active {
  background-color: #6a1e1e;
}

.delete-button:disabled {
  background-color: #4c4c4c;
  cursor: not-allowed;
}

.margin-top {
  margin-top: 0.5rem;
}
</style>
