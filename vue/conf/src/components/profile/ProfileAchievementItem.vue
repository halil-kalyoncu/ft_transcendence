<template>
  <div class="achievement">
    <img
      :src="`../src/assets/achievement-${achievement.achievement.name}.png`"
      :style="{ background: backgroundColor }"
      alt="Achievement"
      class="achievement-image"
    />
    <div class="achievement-content">
      <h2 class="achievement-title">{{ achievement.achievement.name }}</h2>
      <p class="achievement-progress">{{ achievement.progress }} {{ '/' }} {{ currentMax }}</p>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: currentProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
let currentMax = 0

import { ref, computed } from 'vue'
import type { UserAchievementI } from '../../model/achievement/userAchievement.interface'

const props = defineProps<{ achievement: UserAchievementI }>()

const currentProgress = computed(() => {
  currentMax = props.achievement.achievement.scoreGold
  if (props.achievement.progress < props.achievement.achievement.scoreBronze) {
    currentMax = props.achievement.achievement.scoreBronze
  } else if (props.achievement.progress < props.achievement.achievement.scoreSilver) {
    currentMax = props.achievement.achievement.scoreSilver
  } else if (props.achievement.progress < props.achievement.achievement.scoreGold) {
    currentMax = props.achievement.achievement.scoreGold
  }

  const progressRatio = props.achievement.progress / currentMax
  return Math.min(100, progressRatio * 100)
})

const backgroundColor = computed(() => {
  if (props.achievement.progress < props.achievement.achievement.scoreBronze) {
    return 'linear-gradient(to right, #8c7a58, #bfa980)'
  } else if (props.achievement.progress < props.achievement.achievement.scoreSilver) {
    return 'linear-gradient(to right, #b0b0b0, #d7d7d7)'
  } else {
    return 'linear-gradient(to right, #051139, #0d2265)'
  }
})
</script>

<style>
.achievement {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  opacity: 0.9;
  color: #fff;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: 0 1.5rem 1.5rem 0;
  border-radius: 0.25rem;
}

.achievement-progress {
  text-align: center;
}

.achievement-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 1rem;
  border: 0.1rem solid gold;
  border-radius: 0%;
}

.achievement-content {
  display: flex;
  flex-direction: column;
  min-width: 80%;
}

.achievement-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.achievement-description {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 1rem;
  background: #0c0c0c;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: gold;
  transition: width 0.4s ease;
}
</style>
