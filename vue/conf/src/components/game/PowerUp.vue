<template>
  <div
		class="powerup"
		:style="{
			top: `${y}px`,
			left: `${x}px`,
			backgroundColor: `${color}`,
			backgroundImage: `url(${images[index]})`
    }"
  ></div>
</template>

<script setup lang="ts">

import { Socket } from 'socket.io-client'
import { ref } from 'vue' 
import widePaddle from '../../assets/increasePaddle.png'
import smallPaddle from '../../assets/decreasePaddle.png'
import magnet from '../../assets/magnet.png'
import slowBall from '../../assets/slowBall.png'
import fastBall from '../../assets/fastBall.png'

const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    required: true,
    default: 2
  },
  color: {
    type: String,
    required: true,
    default: 'white'
  },
  type: {
	type: String,
	required: true,
	default: 'null'
  },
  socket: Object as any
})

// const PowerUps = ref<any[]>([])
let images = [widePaddle, smallPaddle , magnet, slowBall, fastBall]

// props.socket.on('newPowerUp', (PowerUp: { powerUp: string, x: number, y: number}) => {
// 	const newPowerUp = {
// 	id: Math.floor(Date.now()),
// 	x: PowerUp.x,
// 	y: PowerUp.y,
// 	type: 'null',
// 	index: 0,
// 	color: 'white',
// 	wid: 70,
// 	hgt: 70
//   }
//   if (PowerUp.powerUp == 'increasePaddleHeight') {
// 	newPowerUp.color = 'white'
// 	newPowerUp.index = 0
// 	newPowerUp.type = PowerUp.powerUp
//   } else if (PowerUp.powerUp == 'decreasePaddleHeight') {
// 	newPowerUp.color = 'red'
// 	newPowerUp.index = 1
// 	newPowerUp.type = PowerUp.powerUp
//   } else if (PowerUp.powerUp == 'magnet') {
// 	newPowerUp.color = 'green'
// 	newPowerUp.index = 2
// 	newPowerUp.type = PowerUp.powerUp
//   } else if (PowerUp.powerUp == 'slowBall') {
// 	newPowerUp.color = 'blue'
// 	newPowerUp.index = 3
// 	newPowerUp.type = PowerUp.powerUp
//   } else if (PowerUp.powerUp == 'fastBall') {
// 	newPowerUp.color = 'yellow'
// 	newPowerUp.index = 4
// 	newPowerUp.type = PowerUp.powerUp
//   }
  
//   props.socket.emit('spawnPowerUp', newPowerUp)
//   console.log('PU spawn local')
// 	PowerUps.value?.push(newPowerUp)
// 	// console.log("PU spawn remote");
//   })
</script>

<style>
.powerup {
  position: absolute;
  background-position: center;
  width: 70px;
  height: 70px;
  border-radius: 75%;
  background-size: cover;
}
</style>
