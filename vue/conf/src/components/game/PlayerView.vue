<template>
  <div class="playerView">
	<div class="player1Name">{{ playerA }}</div>
	<!-- <div class="player1Sore">{{ playerA }}</div> -->
	<div class="player2">{{ playerB }}</div>
	</div>
</template>

<script setup lang="ts">
	const props = defineProps<{
		playerA: string;
		playerB: string;
	}>();
</script>

<style scoped>
.playerView {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* top: 50px;
  left: 120px; */
  width: 100%;
  height: 15%;
  font-size: 35px;
  /* background-color:#00000000; */
  background-color: #f5f5f529;
  /* border-radius: 10%; */
  /* z-index: 999; */
}
.player1 {
	text-align: left;
	margin-left: 15%;
  /* position: absolute; */
  /* top: 50px;
  left: 120px; */
  /* width: 100%; */
  /* height: 15%; */
  /* background-color:#00000000; */
  /* background-color: #f5f5f529; */
  /* border-radius: 10%; */
  /* z-index: 999; */
}
.player2 {
	text-align: right;
	margin-right: 15%;
  /* position: absolute; */
  /* top: 50px; */
  /* left:  50%; */
  /* width: 50%; */
  /* height: 15%; */
  /* background-color:#00000000; */
  /* background-color: #f5f5f529; */
  /* border-radius: 10%; */
  /* z-index: 999; */
}
</style>
