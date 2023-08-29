<template>
	<div class="ball" 
	:style="{
		top: `${y}px`,
		left: `${x}px`,
		width: `${wid}px`,
		height: `${hgt}px`
	}"
	>
</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent ({
	setup() {
		let x = ref(500);
		let y = ref(200);
		let wid = ref(15);
		let hgt = ref(15);
		let speed = ref(3);
		let dx = ref(4);
		let dy = ref(3);
		
		function resetBall() {
			x.value=0;
			y.value=0;
			wid.value=15;
			hgt.value=15;
			speed.value=5;
			dx.value=3;
			dy.value=2;
		};

		function setX(newX: number) {
			x.value = newX;
		};
		
		function setY(newY: number) {
			y.value = newY;
		};

		return {
			x,
			y,
			wid,
			hgt,
			speed,
			dx,
			dy,
			setX,
			setY
		}
	}
});
</script>

<style scoped>
.ball {
	position: absolute;
	background: radial-gradient(circle at 30% 30%, #5fcfff, #005a9b 50%, #0066ff);
	border-radius: 50%;
	/* box-shadow: 1px 1px 2px rgba(255, 255, 255, 0.856); */
	/* box-shadow: 3px 5px 5px rgba(0, 0, 0, 0.6); */
}
</style>
