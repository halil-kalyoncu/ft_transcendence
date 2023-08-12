<template>
  <div
    ref="scrollviewRef"
    class="scrollview"
    :style="{ 'max-height': maxHeight, 'padding-right': scrollbarActive ? paddingRight : '0' }"
    @scroll="handleScroll"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, nextTick } from 'vue'

const props = defineProps({
  maxHeight: String,
  paddingRight: String
})

let scrollbarActive = ref(false)

const handleScroll = () => {
  checkForScrollbar()
}

const scrollviewRef = ref<HTMLElement | null>(null)

const checkForScrollbar = () => {
  if (scrollviewRef.value) {
    scrollbarActive.value = scrollviewRef.value.scrollHeight > scrollviewRef.value.clientHeight
  }
}

onMounted(async () => {
  await nextTick()
  checkForScrollbar()
})
</script>

<style>
.scrollview {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #303030;
}

.scrollview::-webkit-scrollbar {
  width: 8px !important;
}

.scrollview::-webkit-scrollbar-track {
  background-color: #303030 !important;
  border-radius: 10px !important;
}

.scrollview::-webkit-scrollbar-thumb {
  background-color: #888 !important;
  border-radius: 10px !important;
}
</style>
