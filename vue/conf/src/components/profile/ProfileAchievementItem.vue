<template>
	<div class="achievement">
		<img :src="`../src/assets/achievement-${achievementType}.png`" alt="Achievement" class="achievement-image" />
		<div class="achievement-content">
			<h2 class="achievement-title">{{ achievementTitle }}</h2>
			<p class="achievement-progress">{{ achievementProgress }}</p>
			<div class="progress-bar">
				<div class="progress-bar-fill" :style="{ width: achievementProg + '%' }"></div>
			</div>
		</div>
	</div>
</template>
  
<script setup lang="ts">
import { ref, computed } from 'vue';

type Props = {
	achievementType: number;
	achievementProgress: number;
}

const props = defineProps<Props>();

const achievementMap = ref({
	1: { 
		title: "Total Goals", 
		tiers: {
			none: 0,
			bronze: 10,
			silver: 25,
			gold: 50
		}
	},
	2: { 
		title: "Flawless Victories", 
		tiers: {
			none: 0,
			bronze: 2,
			silver: 4,
			gold: 6
		}
	},
	3: { 
		title: "Total Wins", 
		tiers: {
			none: 0,
			bronze: 3,
			silver: 7,
			gold: 10
		}
	}
});

const achievementTitle = computed(() => achievementMap.value[props.achievementType].title);

const achievementProg = computed(() => {
	const tiers = achievementMap.value[props.achievementType].tiers;
	let currentMax = tiers.gold;
	if (props.achievementProgress < tiers.bronze) {
		currentMax = tiers.bronze;
	} else if (props.achievementProgress < tiers.silver) {
		currentMax = tiers.silver;
	} else if (props.achievementProgress < tiers.gold) {
		currentMax = tiers.gold;
	}

	const progressRatio = props.achievementProgress / currentMax;
	return Math.min(100, progressRatio * 100);
});
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
	min-width: 40%;
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
}</style>
  