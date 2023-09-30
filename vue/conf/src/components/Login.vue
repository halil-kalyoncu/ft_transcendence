<template>
  <div class="login">
    <div class="login-form">
      <button @click="redirectTo42Authentication" class="dynamic-button">42 Login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '../stores/notification'

const route = useRoute()
const notificationStore = useNotificationStore()

watch(
  () => route.query.error,
  (newError) => {
    if (newError === 'authentication_failed') {
      notificationStore.showNotification('42 Authentication failed', false)
    } else if (newError === 'already_signedIn') {
      notificationStore.showNotification('Already signed in on another browser', false)
    }
  }
)

const redirectTo42Authentication = () => {
  try {
    const clientID = import.meta.env.VITE_API42CLIENTID
    const redirectUri = encodeURIComponent(import.meta.env.VITE_API42REDIRECTURI)
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code`
  } catch (error) {
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
  background: rgba(0, 0, 0, 0.7) !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
