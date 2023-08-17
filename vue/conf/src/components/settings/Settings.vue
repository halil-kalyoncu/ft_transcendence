<template>
  <div class="settings-container">
    <h2 class="page-title">User Settings</h2>

    <div class="input-group">
      <label class="username" for="username">Username:</label>
      <input type="text" id="username" :class="'secondary-btn'" v-model="username" />
    </div>

    <!-- <div class="input-group">
      <label class="username" for="username">Select Avatar:</label>

      <div class="carousel-container" :class="'secondary-btn'">
        <button
          @click="previousImages"
          :disabled="startIndex === 0"
          :class="startIndex === 0 ? 'disabled' : ''"
        >
          ←
        </button>

        <div class="images-displayed">
          <div v-for="img in displayedImages" :key="img" class="center-inner-contents">
            <img
              :src="img"
              alt="Carousel Image"
              @click="setSelectedImage(img)"
              :class="img === selectedImg ? 'selected' : ''"
            />
          </div>
        </div>

        <button
          @click="nextImages"
          :disabled="startIndex > images.length - displayedCount"
          :class="startIndex < images.length - displayedCount ? '' : 'disabled'"
        >
          →
        </button>
      </div>
    </div> -->

    <div class="input-group">
      <label class="username" for="avatar">Upload Avatar:</label>
      <div class="file-upload-wrapper">
        <button type="button" class="secondary-btn upload-btn">
          {{ selectedFileName || 'Choose Avatar' }}
        </button>
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
      <label class="username" for="avatar">Delete Avatar:</label>
      <button class="secondary-btn" @click="deleteAvatar">Delete Avatar</button>
    </div>

    <div class="divider"></div>

    <!-- <div class="input-group" :class="'input-group-single-row'">
      <label class="username" for="enable-2fa">Enable 2FA</label>
      <input type="checkbox" id="enable-2fa" v-model="enable2FA" />
    </div> -->

    <div class="input-group">
      <button class="secondary-btn">enable 2FA</button>
    </div>

    <div class="button-group">
      <button @click="saveChanges" class="save-button">Save Changes</button>
      <button @click="deleteAccount" class="delete-button">Delete Account</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { useUserStore } from '../../stores/userInfo'

const notificationStore = useNotificationStore()

const userStore = useUserStore()
const userId = computed(() => userStore.userId)

const username = ref('')
const enable2FA = ref(false)
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
      const formData = new FormData();
      formData.append('file', uploadedAvatarFile.value);

      const response = await fetch(`http://localhost:3000/api/users/avatar?userId=${userId.value}`, {
        method: 'POST',
        body: formData
      })

      console.log(response)
      if (response.ok) {
        notificationStore.showNotification('Success upload image', true)
      } else {
        notificationStore.showNotification('Failed to upload image', false)
      }
    }
    catch (error: any) {
      notificationStore.showNotification(`Error` + error.message, false)
    }
  }
}

const deleteAvatar = () => {
  avatarInput.value = null
}

const saveChanges = () => {
  console.log('Saving changes...')
}

const deleteAccount = () => {
  const confirmDelete = window.confirm('Are you sure you want to delete your account?')
  if (confirmDelete) {
    console.log('Deleting account...')
  }
}
</script>

<style scoped>
.settings-container {
  width: 100%;
  margin: 1.5rem;
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
  box-sizing: border-box !important;
}

.settings-container .username {
  font-size: 1.125rem;
  display: block;
}

.settings-container .username-input {
  display: block;
}

input[type='text'],
input[type='file'] {
  padding: 10px;
  width: calc(100% - 0.25rem);
  margin-top: 8px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
}

.page-title {
  text-align: left;
  margin: 0 0 1.25rem 0;
  font-size: 2.25rem;
  font-weight: bold;
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
  justify-content: space-between;
  margin-top: 2.5rem;
}

.secondary-btn {
  background: #333;
  margin-left: 0.25rem;
  min-width: 250px;
  border-radius: 0.125rem;
}
.secondary-btn:focus {
  outline: solid 0.25px #ea9f42;
}

.delete-button {
  color: #ff3333;
  border-color: #ff3333;
}

.file-upload-wrapper {
  position: relative;
  width: fit-content;
  display: inline-block;
}

.upload-btn {
  cursor: pointer;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.carousel-container {
  display: flex;
  align-items: center;
  width: calc(100% - 0.25rem);
  justify-content: space-between;
  padding: 0.5rem;
}

.images-displayed {
  display: flex;
  gap: 10px;
  overflow: hidden;
}

img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

img.selected {
  border: 0.01rem solid #ea9f42;
  border-radius: 0.5rem;
}

button {
  background: #444;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

button:hover {
  background: #555;
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

.center-inner-contents {
  display: flex;
  justify-content: center;
  align-items: center;
}
.save-button {
  background-color: #32a852;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #288740;
}

.save-button:active {
  background-color: #1e6a30;
}

.save-button:disabled {
  background-color: #4c4c4c;
  cursor: not-allowed;
}

.delete-button {
  background-color: #a83232;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #872828;
}

.delete-button:active {
  background-color: #6a1e1e;
}

.delete-button:disabled {
  background-color: #4c4c4c;
  cursor: not-allowed;
}

.input-group-single-row {
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
#enable-2fa {
  margin-left: 1rem;
}

.divider {
  height: 1px; /* Skinny line */
  background-color: #444; /* Dark gray color */
  margin: 0.5rem -0.1rem; /* Space above and below the divider */
}
</style>
