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
  }
})
let images = [widePaddle, smallPaddle, magnet, slowBall, fastBall]
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
