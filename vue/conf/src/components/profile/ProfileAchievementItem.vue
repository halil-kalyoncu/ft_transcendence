<template>
  <div
    class="achievement"
    :class="{ 'is-inactive': props.achievement.state === UserAchievementState.NONE }"
  >
    <div class="achievement-wrapper">
      <img
        :src="`../src/assets/achievement-${achievement.achievement.name}.png`"
        :style="{ background: backgroundColor }"
        alt="Achievement"
        class="achievement-image"
      />
      <div class="achievement-content">
        <h2 class="achievement-title">{{ achievement.achievement.name }}</h2>
        <div
          class="progress-bar"
          @mouseover="showTooltip"
          @mousemove="updateTooltipPosition"
          @mouseout="hideTooltip"
        >
          <div class="progress-bar-fill" :style="{ width: currentProgress + '%' }"></div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div
        v-if="tooltipVisible"
        :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
        class="tooltip-box"
      >
        <div>{{ 'Progress: ' }} {{ achievement.progress }} {{ '/' }} {{ currentMax }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
let currentMax = ref(0)

import { ref, computed, onMounted } from 'vue'
import {
  UserAchievementState,
  type UserAchievementI
} from '../../model/achievement/userAchievement.interface'

const props = defineProps<{ achievement: UserAchievementI }>()

const currentProgress = computed(() => {
  currentMax.value = 0
  if (props.achievement.progress < props.achievement.achievement.scoreBronze) {
    currentMax.value = props.achievement.achievement.scoreBronze
  } else if (props.achievement.progress < props.achievement.achievement.scoreSilver) {
    currentMax.value = props.achievement.achievement.scoreSilver
  } else if (props.achievement.progress < props.achievement.achievement.scoreGold) {
    currentMax.value = props.achievement.achievement.scoreGold
  }

  const progressRatio = props.achievement.progress / currentMax.value
  return Math.min(100, progressRatio * 100)
})

const backgroundColor = computed(() => {
  if (props.achievement.state == UserAchievementState.BRONZE) {
    return 'radial-gradient(circle, #ffcc66, #cd7f32)'
  } else if (props.achievement.state == UserAchievementState.SILVER) {
    return 'radial-gradient(circle, #e6e6e6, #a8a8a8)'
  } else if (props.achievement.state == UserAchievementState.GOLD) {
    return 'radial-gradient(circle, #ffff33, #ff9900)'
  } else {
    return
  }
})

let tooltipVisible = ref(false)
let tooltipX = ref(0)
let tooltipY = ref(0)

const showTooltip = () => {
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const updateTooltipPosition = (event: MouseEvent) => {
  tooltipX.value = event.clientX + 10
  tooltipY.value = event.clientY + 10
}
</script>

<style>
.achievement {
  position: relative;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  opacity: 0.9;
  color: #fff;
  padding: 11px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: 0 1.5rem 1.5rem 0;
  border-radius: 0.25rem;
}

.achievement-progress {
  text-align: center;
}

.achievement-image {
  display: flex;
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
  width: 100%;
  margin-top: 3px;
  margin-left: 5px;
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
  display: flex;
  height: 1rem;
  background: #0c0c0c;
  border-radius: 5px;
  overflow: hidden;
  z-index: 2;
  margin-top: 25px;
}

.progress-bar-fill {
  height: 100%;
  background: gold;
  transition: width 0.4s ease;
}

.achievement-wrapper {
  display: flex;
  min-width: 40%;
}

.achievement.is-inactive .achievement-wrapper {
  filter: grayscale(100%);
  opacity: 0.5;
}

.tooltip-box {
  position: fixed;
  box-sizing: border-box;
  background-color: rgba(18, 18, 18, 0.8);
  /* border-width: 2px; */
  /* border: 1px solid rgb(78, 78, 78); */
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  z-index: 1000;
  opacity: 1;
  pointer-events: none;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
