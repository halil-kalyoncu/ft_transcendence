<template>
  <div class="achievement" :style="{ background: backgroundColor }">
    <img
      :src="`../src/assets/achievement-${achievement.achievement.name}.png`"
      alt="Achievement"
      class="achievement-image"
    />
    <div class="achievement-content">
      <h2 class="achievement-title text">{{ achievement.achievement.name }}</h2>
      <p class="achievement-progress text">{{ achievement.progress }}</p>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: currentProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserAchievementI } from '../../model/achievement/userAchievement.interface'

const props = defineProps<{ achievement: UserAchievementI }>()

const currentProgress = computed(() => {
  let currentMax = props.achievement.achievement.scoreGold
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
    return 'linear-gradient(to right, #8c7a58, #bfa980)' // Background for bronze
  } else if (props.achievement.progress < props.achievement.achievement.scoreSilver) {
    return 'linear-gradient(to right, #b0b0b0, #d7d7d7)' // Background for silver
  } else {
    return 'linear-gradient(to right, #051139, #0d2265)' // Background for gold
  }
})
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
  min-width: 80%;
}

.achievement-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.achievement-description {
  font-size: 1rem;
  margin-bottom: 1rem;
  /* Added some margin to space out the progress bar */
}

.progress-bar {
  height: 1rem;
  background: #333;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: gold;
  /* color for the progress */
  transition: width 0.4s ease;
}

.text {
  color: black;
}
</style>
