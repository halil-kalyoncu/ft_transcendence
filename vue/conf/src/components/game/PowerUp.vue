<template>
	<div class="powerup"
    :style="{ top: `${y}px`, left: `${x}px`, background: `red` }"
	>
</div>
</template>

<script>

export default {
	props: {
		id: {
			type: Number,
			required: true
		},
		x: {
			type: Number,
			required: true,
		},
		y: {
			type: Number,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
	},
	
	methods: {
		setX(x) {
			this.x = x;
		},
		
		setY(y) {
			this.y = y;
		},
	}
}
</script>

<style>
.powerup {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 75%;
  background-size: cover;
}
</style>
