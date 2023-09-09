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

<script>
import widePaddle from '../../assets/bigger_paddle.png'
import magnet from '../../assets/magnet.png'
import image2 from '../../assets/avatar-2.png'
import image1 from '../../assets/avatar-1.png'

export default {
  data() {
    return {
      images: [widePaddle, magnet, image2, image1]
    }
  },
  props: {
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
      default: 0
    },
    color: {
      type: String,
      required: true,
      default: 'white'
    },
    type: {
      type: Number,
      required: true
    }
  },

  methods: {
    setX(x) {
      this.x = x
    },

    setY(y) {
      this.y = y
    }
  }
}
</script>

<style>
.powerup {
  position: absolute;
  background-position: center;
  width: 30px;
  height: 30px;
  border-radius: 75%;
  background-size: cover;
}
</style>
