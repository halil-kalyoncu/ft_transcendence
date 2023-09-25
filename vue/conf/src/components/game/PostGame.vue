<template>
	<div class="field" >
		<div v-if="playerAScore > playerBScore" class="winner">
			<div class="headline">{{ playerA }} has won!</div>
			<div class="trophys">
				<div class="trophyA" :style="{backgroundImage: `url(${image[0]})`}"></div>
				<div class="trophyB" :style="{backgroundImage: `url(${image[1]})`}"></div>
			</div>
		</div>
		<div v-else-if="playerAScore < playerBScore" class="winner">
			<div class="headline">{{ playerB }} has won!</div>
			<div class="trophys">
				<div class="trophyA" :style="{backgroundImage: `url(${image[1]})`}"></div>
				<div class="trophyB" :style="{backgroundImage: `url(${image[0]})`}"></div>
			</div>
		</div>
		<div v-else class="winner">
			<div class="headline">Its a draw!</div>
			<div class="trophys"></div>
		</div>
		<div class="players">
			<div class="playerA">{{ playerA }}</div>
			<div class="playerB">{{ playerB }}</div>
		</div>
		<div class="score">{{ playerAScore + ' | ' + playerBScore }}</div>
	</div>
</template>


<script setup lang="ts">
import Trophy from '../../assets/trophy.png'
import SadFace from '../../assets/sad_face.png'
let image = [Trophy, SadFace]
const props = defineProps<{
	playerA: string
	playerB: string
	playerAScore: number
	playerBScore: number
}>()
</script>


<style scoped>
.field{
	width: 800px;
	height: 600px;
}
.winner {
	width: 100%;
	height: 50%;
}
.headline {
	width: 100%;
	height: 100px;
	display: flex;
	font-weight: bold;
	align-items: center;
	justify-content: center;
	font-size: 50px;
}
.trophys {
	display: flex;
	justify-content: space-between;
  	align-items: center;
	width: 100%;
	height: 70%;
}

.trophyA,
.trophyB{
	width: 20%;
  	height: 70%;
	background-position: center;
	background-size: cover;
	margin: 0 15% ;
} 

.players {
	display: flex;
	width: 100%;
}

.playerA,
.playerB {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 50px;
}
.score {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 100px;
}

</style>