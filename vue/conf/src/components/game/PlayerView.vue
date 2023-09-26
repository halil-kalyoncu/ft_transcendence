<template>
	<!-- <div class="goals-to-beat">{{ goalsToBeat }}</div> -->
	<div class="playerView">
	  <div class="playerA">
		  <div class="playerAName">{{ shortenName(playerA) }}</div>
		  <div class="playerAScore">{{ playerAScore }}</div>
	  </div>
	  <div class="playerB">
		  <div class="playerBName">{{ shortenName(playerB) }}</div>
		  <div class="playerBScore">{{ playerBScore }}</div>
	  </div>
	</div>
</template>

<script setup lang="ts">

const shortenName = (name: string) => {
	if (name.length > 6)
		return name.substring(0, 6) + "...";
	return name;
}

const props = defineProps<{
  playerA: string
  playerB: string
  playerAScore: number
  playerBScore: number
}>()
</script>

<style scoped>
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
