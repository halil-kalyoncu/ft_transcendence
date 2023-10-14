<template>
  <div
    class="ball"
    :style="{
      top: `${y}px`,
      left: `${x}px`,
      width: `${wid}px`,
      height: `${hgt}px`
    }"
  ></div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    let x = ref(400)
    let y = ref(300)
    let wid = ref(15)
    let hgt = ref(15)
    let speed = ref(3)
    let dx = ref(4 * (Math.random() < 0.5 ? 1 : -1))
    let dy = ref(3)

    function setX(newX: number) {
      x.value = newX
    }

    function setY(newY: number) {
      y.value = newY
    }

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
})
</script>

<style scoped>
.ball {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, #5fcfff, #005a9b 50%, #0066ff);
  border-radius: 50%;
}
</style>
