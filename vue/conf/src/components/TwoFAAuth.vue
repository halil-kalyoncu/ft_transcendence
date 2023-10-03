<template>
  <div class="login">
    <form @submit.prevent="submitForm" class="login-form">
      <label for="twoFACode" class="font-color">Code:</label>
      <input type="text" id="twoFACode" v-model="twoFACode" required />
      <button type="submit" role="link" class="dynamic-button">42 Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'

const route = useRoute()
const intraLogin = route.params.intraLogin as string
const router = useRouter()
const notificationStore = useNotificationStore()

const twoFACode = ref('')

const submitForm = async () => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/2fa/checkFAcode?intraLogin=${intraLogin}&code=${twoFACode.value}`
    )

    twoFACode.value = ''
    if (response.ok) {
      const responseData = await response.text()
      notificationStore.showNotification('Validation successful', true)
      router.push(`/validateToken/${responseData}`)
    } else {
      const responseMessage = await response.json()
      notificationStore.showNotification('Validation failed: ' + responseMessage.message, false)
      if (response.status !== 401) {
        router.push('/')
      }
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong during Validation', false)
    router.push('/')
  }
}
</script>

<style>
.login {
  background-color: transparent;
  width: 100vw;
  height: 100vh;
  position: relative;
  background: rgba(0, 0, 0, 0.5);
}

.login-form {
  width: 400px;
  height: 300px;
  position: absolute;
  top: 50%;
  left: 60%;
  transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translateX(-50%) translateY(-50%);
  -moz-transform: translateX(-50%) translateY(-50%);
  text-align: center;
}

.login-form input {
  padding: 0.5rem 0.25rem;
  background-color: lightgray;
  border-radius: 0.25rem;
  margin: 1rem;
}

.login-form input:focus {
  outline: solid 2px #ea9f42;
}

.font-color {
  color: #ea9f42;
}

@keyframes entranceAnimation {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dynamic-button {
  animation: entranceAnimation 0.5s forwards;
  background-color: transparent;
  border: 1px solid #ea9f42;
  color: #ea9f42;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.dynamic-button:hover {
  background-color: #ea9f42;
  color: white;
}

.dynamic-button:active {
  transform: scale(0.95);
  background-color: #d97c30;
}

.dynamic-button:before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background: linear-gradient(45deg, #ea9f42, transparent, #ea9f42);
  transform: skewX(-20deg) scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.dynamic-button:hover:before {
  transform: skewX(-20deg) scaleX(1);
}
</style>
