<template>
  <div
    class="scrollview"
    :style="{ 'max-height': maxHeight, 'padding-right': scrollbarActive ? paddingRight : '0' }"
    @scroll="handleScroll">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'

const props = defineProps({
  maxHeight: String,
  paddingRight: String
})

let scrollbarActive = ref(false)

const handleScroll = () => {
  scrollbarActive.value = true
}

onMounted(async () => {
  await nextTick()
  watchEffect(() => {
    const scrollview = document.querySelector('.scrollview')
    if (scrollview) {
      const scrollHeight = scrollview.scrollHeight
      const clientHeight = scrollview.clientHeight

      scrollbarActive.value = scrollHeight > clientHeight
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
.scrollview {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #303030;
}

.scrollview::-webkit-scrollbar {
  width: 8px;
}

.scrollview::-webkit-scrollbar-track {
  background-color: #303030;
  border-radius: 10px;
}

.scrollview::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}
</style>
