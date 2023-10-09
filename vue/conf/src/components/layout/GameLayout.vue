<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main>
    <section>
      <RouterView />
    </section>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #3b3b3b, #000 50%);
  background-position: center;
  font-family: 'Courier New', Courier, monospace;
}
</style>
