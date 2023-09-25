<template>
  <div class="settings-container">
    <h2 class="page-title">User Settings</h2>

    <div class="input-group">
      <input type="text" id="username" placeholder="Enter username" v-model="username" />
    </div>

    <div class="input-group">
      <div class="file-upload-wrapper">
        <label for="avatar" class="secondary-btn upload-btn"> Choose Avatar </label>
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
      <button @click="enable2FA" class="secondary-btn">
        {{ twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA' }}
      </button>
    </div>
    <div v-if="showEnable2FA && !twoFAEnabled">
      <div class="qr-code-container">
        <img :src="qrCodeImage" alt="QR Code" class="qrcode" />
      </div>
      <div class="input-group">
        <div class="input-group-item">
          <input
            type="text"
            id="2fa"
            placeholder="Enter 2FA code"
            class="two-FA-input"
            v-model="twoFAcode"
          />
          <button @click="confirm2FA" class="secondary-btn confirm-button">Confirm 2FA</button>
        </div>
      </div>
    </div>
    <div v-if="showEnable2FA && twoFAEnabled">
      <div class="input-group">
        <div class="input-group-item">
          <input
            type="text"
            id="2fa"
            placeholder="Enter 'OK' to disable"
            class="two-FA-input"
            v-model="confirmation"
          />
          <button @click="confirmDisable2FA" class="secondary-btn confirm-button">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'

const notificationStore = useNotificationStore()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const username = ref('')
const twoFAcode = ref('')
const confirmation = ref('')
const showEnable2FA = ref(false)
const twoFAEnabled = ref(true)
const avatarInput: Ref<HTMLInputElement | null> = ref(null)
const uploadedAvatarFile: Ref<File | null> = ref(null)
const selectedFileName = ref('')
const images = ref([
  'src/assets/avatar-1.png',
  'src/assets/avatar-2.png',
  'src/assets/avatar-3.png',
  'src/assets/avatar-2.png'
])
const qrCodeImage = ref('')
const displayedCount = 3
const startIndex = ref(0)
const selectedImg = ref('src/assets/avatar-1.png')

const setSelectedImage = (img: string) => {
  selectedImg.value = img
}

const handleAvatarUpload = async () => {
  if (avatarInput.value && avatarInput.value.files && avatarInput.value.files.length) {
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
        await userStore.fetchUser()
        await userStore.fetchAvatar()
      } else {
        notificationStore.showNotification('Failed to upload image', false)
      }
    } catch (error: any) {
      notificationStore.showNotification('Error' + error.message, false)
    }
  }
}

const deleteAvatar = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/avatar/${userId.value}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      }
    })

    const responseData = await response.json()
    if (response.ok) {
      notificationStore.showNotification('Success delete avatar', true)
      userStore.clearAvatar()
    } else {
      notificationStore.showNotification(
        'Error while deleting avatar ' + responseData.message,
        false
      )
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while deleting avatar', false)
  }
}

const generateQRCode = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/2fa/generate?userId=${userId.value}`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    // Convert the response to a blob (binary data)
    const blob = await response.blob()

    // Create a URL for the blob data
    const imageUrl = URL.createObjectURL(blob)
    qrCodeImage.value = imageUrl
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const enable2FA = () => {
  if (showEnable2FA.value) {
    showEnable2FA.value = false
    return
  }
  generateQRCode()
  showEnable2FA.value = true
}

const check2FAcode = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId.value,
        code: twoFAcode.value
      })
    })
    if (!response.ok) {
      const responseData = await response.json()
      notificationStore.showNotification(responseData.message, false)
    } else {
      notificationStore.showNotification('2FA enabled', true)
      showEnable2FA.value = false
      twoFAcode.value = ''
      twoFAEnabled.value = true
    }
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const confirm2FA = () => {
  check2FAcode()
}

const disable2FA = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/2fa/disable?userId=${userId.value}`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    } else {
      notificationStore.showNotification('2FA disabled', true)
      showEnable2FA.value = false
      confirmation.value = ''
      twoFAEnabled.value = false
    }
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
  }
}

const confirmDisable2FA = () => {
  if (confirmation.value === 'OK') {
    disable2FA()
  } else {
    notificationStore.showNotification('Wrong Confirmation', false)
  }
}

const set2FAStatus = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/2fa/twoFAstatus?userId=${userId.value}`,
      {
        method: 'GET'
      }
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    } else {
      twoFAEnabled.value = await response.json()
    }
  } catch (error: any) {
    notificationStore.showNotification(`Error` + error.message, false)
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

  set2FAStatus()
})
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
.secondary-btn.confirm-button:hover,
.secondary-btn.upload-btn:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
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

.secondary-btn:active {
  background-color: #ea9f42; /* Change the background color when the button is clicked */
  border: none; /* Remove the border when the button is clicked */
  color: #ffffff; /* Change the text color when the button is clicked */
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

.input-group .two-FA-input {
  padding: 0.5rem 1rem;
  /* min-width: 200px;  */
  min-height: 35px;
  min-width: 200px;
  border: 1px solid #ba4646;
  border-radius: 4px;
  font-size: 15px;
  color: #ffffff;
}

.input-group .confirm-button {
  padding: 0.5rem 1rem;
  min-width: 30px;
  min-height: 35px;
  border: 1px solid aliceblue;
  border-radius: 4px;
  font-size: 15px;
  color: #ffffff;
}
.qr-code-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  max-width: 100%;
}
/* TODO: Make this responsive  */
.qr-code-container .qrcode {
  flex-grow: 1;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.margin-top {
  margin-top: 0.5rem;
}
</style>
