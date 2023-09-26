<template>
  <div class="login">
    <form @submit.prevent="submitForm" class="login-form">
      <label for="username" class="font-color">Username:</label>
      <input type="text" id="username" v-model="username" required />
      <button type="submit" role="link" class="dynamic-button">42 Login</button>
    </form>
	<button @click="handle42Api">Go to hell</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userInfo'
import { useNotificationStore } from '../stores/notification'
import { connectChatSocket } from '../websocket'

const username = ref('')
const userId = computed(() => userStore.userId)
const router = useRouter()
const notificationStore = useNotificationStore()

const get2FAStatus = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/2fa/twoFAstatus?userId=${userId.value}`,
      {
        method: 'GET',
      }
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    } else {
      return await response.json()
    }
  } catch (error) {
    console.error('Error occurred during 2FA status check:', error)
    notificationStore.showNotification('Error occurred during 2FA status check:' + error, false)
  }
}

const userStore = useUserStore()

const submitForm = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value })
    })

    const responseData = await response.json()
    if (response.ok) {
      localStorage.setItem('ponggame', responseData.access_token)
      await userStore.initStore()
      connectChatSocket(responseData.access_token)
      const is2FAenabled = await get2FAStatus()

      if (is2FAenabled) {
        router.push('/twoFAAuth')
      } else {
        router.push('/home')
      }
    } else {
      notificationStore.showNotification(
        'Error occurred during login' + responseData.message,
        false
      )
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong during login', false)
  }
}

const handle42Api = async () => {
	try {
		const clientID = "u-s4t2ud-ed681aac38facba73c47424c0e7e832f42a961819948f18cfcd350cc1da505e7";
		const redirectUri = encodeURIComponent('http://10.12.5.1:3000/api/auth/callback');

		const response = await fetch(`https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		console.log(response)
		if (response.ok) {
			const responseData = await response.json()
		}
		else {
			notificationStore.showNotification('Failed to authenticate with 42', false)
		}
	}
	catch (error) {
		console.log(error);
		notificationStore.showNotification('Something went wrong when redirecting to 42intra', false)
	}
}

</script>

<style>
.login {
  background-color: transparent;
  width: 100vw;
  height: 100vh;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
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
