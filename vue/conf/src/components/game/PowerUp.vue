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
import { ref } from 'vue'
import widePaddle from '../../assets/bigger_paddle.png'
import magnet from '../../assets/magnet.png'
import image2 from '../../assets/avatar-2.png'
import image1 from '../../assets/avatar-1.png'

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
  }
})
let images = [widePaddle, magnet, image2, image1]
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
