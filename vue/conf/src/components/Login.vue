<template>
  <div class="login">
    <form @submit.prevent="submitForm" class="login-form">
      <label for="username">Username:</label>
      <input type="text" id="username" v-model="username" required />
      <button type="submit" role="link">42 Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useRouter } from 'vue-router';

const username = ref('');
const router = useRouter();

const submitForm = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Username': 'abc',
      },
      body: JSON.stringify({ username: username.value }),
    });

    if (response.ok) {
      // Handle successful login
      console.log('Login successful');
      router.push('/home');
    } else {
      // Handle login failure
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Error occurred during login:', error);
  }
};
</script>


<style>
.login {
  background-color: #0d1117;
  width: 100vw;
  height: 100vh;
  position: relative;
}

.login-form {
  width: 400px;
  height: 300px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translateX(-50%) translateY(-50%);
  -moz-transform: translateX(-50%) translateY(-50%);
  text-align: center;
}


.login-form input{
  padding: .5rem .25rem;
  background-color: lightgray;
  border-radius: .25rem;
  margin: 1rem;
}

.login-form input:focus{
  outline:solid 2px #ea9f42;
}

.login button {
  text-align: center;
  border: 0.1rem solid #e6edf3;
  color: #e6edf3;
  font-size: 1.75rem;
  background-color: transparent;
  padding: 0.25rem 2rem;
  cursor: pointer;
  transition: 0.15s ease-in-out;
}

.login button:hover {
  color: #0d1117;
  background-color: #e6edf3;
}
</style>
