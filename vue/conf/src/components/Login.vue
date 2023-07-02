<script setup lang="ts" />

<template>
  <div class="login">
    <router-link to="/home" custom v-slot="{ navigate }">
      <button @click="navigate" role="link">42 Login</button>
    </router-link>
  </div>
</template>

<style>
.login {
  background-color: #0d1117;
  width: 100vw;
  height: 100vh;
}

.login button {
  text-align: center;
  border: 0.1rem solid #e6edf3;
  color: #e6edf3;
  font-size: 1.75rem;
  background-color: transparent;
  padding: 0.25rem 2rem;
  cursor: pointer;
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translateX(-50%) translateY(-50%);
  -moz-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  transition: 0.15s ease-in-out;
}

.login button:hover {
  color: #0d1117;
  background-color: #e6edf3;
}
</style>
