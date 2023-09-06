<template>
  <div class="achievement">
    <img
      :src="`../src/assets/achievement-${achievementType}.png`"
      alt="Achievement"
      class="achievement-image"
    />
    <div class="achievement-content">
      <h2 class="achievement-title">{{ achievementTitle }}</h2>
      <p class="achievement-description">{{ achievementDescription }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  achievementType: number
  achievementTitle: string
  achievementDescription: string
}

defineProps<Props>()
</script>

<style>
.achievement {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #051139, #0d2265);
  opacity: 0.9;
  padding: 1rem;
  color: white;
  border-radius: 0.25rem;
  margin: 0 1.5rem 1.5rem 0;
}
.achievement-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 1rem;
  border: 0.1rem solid gold;
  border-radius: 50%;
}
.achievement-content {
  display: flex;
  flex-direction: column;
}
.achievement-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.achievement-description {
  font-size: 1rem;
}
</style>
