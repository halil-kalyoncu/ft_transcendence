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

<script>

export default {
	props: ['posX', 'posY', 'width', 'height', 'fieldWidth', 'fieldHeight', 'socket'],
	data() {
		return {
			x: 500,
			y: 200,
			wid: 15,
			hgt: 15,
			speed: 5,
			dx: 4,
			dy: 3
		}
	},
	
	methods: {
		
		resetBall() {
			this.x=0;
			this.y=0;
			this.wid=15;
			this.hgt=15;
			this.speed=5;
			this.dx=3;
			this.dy=2;
		},
		
		setX(x) {
			this.x = x;
		},
		
		setY(y) {
			this.y = y;
		},
	}
}
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
