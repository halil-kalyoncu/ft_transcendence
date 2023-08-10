<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
</script>

<template>
  <div class="home">
    <RouterLink class="navButton" to="/game">PLAY</RouterLink>
	<RouterLink class="navButton" to="/invite">INVITE</RouterLink>
  </div>
</template>

<style>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100vh - 50.8px);
  background-color: #171717;
}

.home a {
  padding: 0 2.5rem;
  font-size: 2rem;
  background-color: #19c37d;
  color: #ffffff;
  border: none;
  transition: all 0.25s ease-in;
  cursor: pointer;
  outline: none;
  text-decoration: none;
  animation: appear 0.5s ease-out;
}

.home a:hover {
  background-color: #005600;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
}

@keyframes appear {
  from {
    background-color: #005600;
    transform: scale(1.25);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
  }
  to {
    transform: scale(1);
  }
}
</style>
