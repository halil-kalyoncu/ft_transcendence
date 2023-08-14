<script setup lang="ts">
import type { UserI } from '../../model/user.interface'

const props = defineProps({
  user: {
    type: Object as () => UserI,
    required: true
  }
})
</script>

<template>
  <div>
    <span>{{ props.user.username }}</span>
  </div>
</template>
