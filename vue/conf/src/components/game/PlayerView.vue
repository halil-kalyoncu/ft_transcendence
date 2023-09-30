<template>
  <div class="goals-to-beat">Goals to beat: {{ goalsToBeat }}</div>
  <div class="playerView">
    <div class="playerA">
      <div class="playerAName">{{ playerA }}</div>
      <div class="playerAScore">{{ playerAScore }}</div>
    </div>
    <div class="playerB">
      <div class="playerBName">{{ playerB }}</div>
      <div class="playerBScore">{{ playerBScore }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  playerA: String,
  playerB: String,
  playerAScore: Number,
  playerBScore: Number,
  goalsToBeat: Number
})
</script>

<style scoped>
.goals-to-beat {
  display: flex;
  justify-content: center;
}
.playerView {
  position: absolute;
  display: flex;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1200px;
}
.playerA {
  text-align: left;
  flex: 1;
  font-size: 30px;
}
.playerB {
  text-align: right;
  flex: 1;
  font-size: 30px;
}
</style>
