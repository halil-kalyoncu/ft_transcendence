<template>
  <div
    class="paddle"
    :style="{
      top: `${y}px`,
      left: `${x}px`,
      height: `${hgt}px`,
      width: `${wid}px`
    }"
  ></div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'

export type GamePaddleSetup = {
  x: ReturnType<typeof ref>
  y: ReturnType<typeof ref>
  wid: ReturnType<typeof ref>
  hgt: ReturnType<typeof ref>
  speed: ReturnType<typeof ref>
  movePaddleUp: () => void
  movePaddleDown: () => void
  getPaddleX: () => number
  getPaddleY: () => number
  setY: (newY: number) => void
  setX: (newX: number) => void
  increaseHgt: () => void
  decreaseHgt: () => void
  resetHgt: () => void
  setWid: (newwid: number) => void
  getPaddleWidth: () => number
  getPaddleHeight: () => number
  getPaddleSpeed: () => number
}

export default defineComponent({
  setup() {
    // const fieldHeight = ref(props.fieldHeight);
    // const socket = ref(props.socket);

    let x = ref(1)
    let y = ref(100)
    let wid = ref(15)
    let hgt = ref(100)
    let speed = ref(7)

    function getPaddleX() {
      return x.value
    }

    function getPaddleY() {
      return y.value
    }

    function setY(newY: number) {
      y.value = newY
    }

    function setX(newX: number) {
      x.value = newX
    }

    // function setHgt(newhgt: number) {
    //   hgt.value = newhgt
    // }

    function increaseHgt() {
      if (hgt.value < 400) {
        hgt.value += 20
      }
    }

    function decreaseHgt() {
      if (hgt.value > 40) {
        hgt.value -= 20
      }
    }

    function resetHgt() {
      hgt.value = 100
    }

    function setWid(newwid: number) {
      wid.value = newwid
    }

    function getPaddleWidth() {
      return wid.value
    }

    function getPaddleHeight() {
      return hgt.value
    }

    function getPaddleSpeed() {
      return speed.value
    }
    return {
      x,
      y,
      wid,
      hgt,
      speed,
      getPaddleX,
      getPaddleY,
      setY,
      setX,
      increaseHgt,
      decreaseHgt,
      resetHgt,
      setWid,
      getPaddleWidth,
      getPaddleHeight,
      getPaddleSpeed
    }
  }
})
</script>

<style scoped>
.paddle {
  position: absolute;
  background: linear-gradient(to right, #0074d9, #0047ab);
  /* Gradient for depth */
  box-shadow: 2px 3px 5px rgba(0, 174, 255, 0.5),
    /* Brighter cyan glow to the left */ -3px 0 15px rgba(0, 0, 0, 0.3),
    /* Darker inner shadow on the left */ inset 2px 3px 3px rgba(255, 255, 255, 0.2),
    inset -2px -3px 3px rgba(0, 0, 0, 0.5), inset 2px 0 5px rgba(255, 255, 255, 0.3),
    inset -2px 0 5px rgba(0, 0, 0, 0.3);
}
</style>
