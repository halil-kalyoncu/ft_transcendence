<template>
  <div class="playerView">
    <div class="playerAName">{{ playerA }}</div>
    <div class="playerBName">{{ playerB }}</div>
    <div class="playerAScore">{{ playerAScore }}</div>
    <div class="playerBScore">{{ playerBScore }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  playerA: string
  playerB: string
  playerAScore: number
  playerBScore: number
}>()
</script>

<style scoped>
.playerView {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  /* grid- */
  /* top: 50px;
  left: 120px; */
  width: 100%;
  /* height: 15%; */
  font-size: 35px;
  /* background-color:#00000000; */
  background-color: #f5f5f529;
  /* border-radius: 10%; */
  /* z-index: 999; */
}
.playerAName {
  text-align: left;
  margin-left: 5%;
  /* border: 1px solid white;  */
}
.playerAScore {
  text-align: left;
  margin-left: 5%;
  /* border: 1px solid white;  */
}
.playerBName {
  text-align: right;
  margin-right: 5%;
  /* border: 1px solid white;  */
}
.playerBScore {
  text-align: right;
  margin-right: 5%;
  /* border: 1px solid white;  */
}
</style>
