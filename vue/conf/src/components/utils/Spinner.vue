<template>
  <div class="spinner"></div>
</template>

<style>
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid black;
  width: 25px;
  height: 25px;
  animation: spin 1s linear infinite;
  margin-right: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
