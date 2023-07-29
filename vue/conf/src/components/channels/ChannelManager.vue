<template>
    <h2>Channel Manager View</h2>
    <p>Channel Id: {{channelId}}</p>
</template>

<script setup lang="ts">

const props = defineProps({
  channelId: Number
})
</script>