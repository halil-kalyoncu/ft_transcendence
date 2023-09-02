<template>
  <div class="login">
    <form @submit.prevent="submitForm" class="login-form">
      <label for="username" class="font-color">Username:</label>
      <input type="text" id="username" v-model="username" required />
      <button type="submit" role="link" class="dynamic-button">42 Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userInfo'
import { useNotificationStore } from '../stores/notification'
import { connectWebSocket } from '../websocket'
import type { UserI } from '../model/user.interface'
import jwtDecode from 'jwt-decode'
import { fetchAndSaveAvatar } from '../utils/fetchAndSaveAvatar'

const username = ref('')
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const submitForm = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value })
    })

    if (response.ok) {
      console.log('Login successful')
      const { access_token } = await response.json()
      //save jwt into local storage
      localStorage.setItem('ponggame', access_token)
      try {
        const decodedToken: Record<string, unknown> = jwtDecode(access_token)
        const loggedUser: UserI = decodedToken.user as UserI
        userStore.setUserId(loggedUser.id as number)
        if (loggedUser.avatarId) {
          fetchAndSaveAvatar()
        }
      } catch (error: any) {
        console.error('Invalid token:', error)
        notificationStore.showNotification('Invalid Token', false)
      }
      userStore.setUsername(username.value)
      connectWebSocket('http://localhost:3000', access_token)
      router.push('/home')
    } else {
      console.error('Login failed!! ' + response.status + ': ' + response.statusText)
      notificationStore.showNotification(response.status + ': ' + response.statusText, false)
    }
  } catch (error) {
    console.error('Error occurred during login:', error)
    notificationStore.showNotification('Error occurred during login:' + error, false)
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
