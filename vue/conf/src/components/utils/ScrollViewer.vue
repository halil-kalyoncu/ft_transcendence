<template>
  <div class="scrollview" :style="{ 'max-height': maxHeight, 'padding-right': paddingRight }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  maxHeight: String,
  paddingRight: String
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