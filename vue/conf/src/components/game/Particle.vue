<template>
  <div class="particle" :style="{ top: `${y}px`, left: `${x}px`, background: `white` }"></div>
</template>

<script>
export default {
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    angle: Number
  },

  mounted() {
    const distance = 50 // You can adjust this value
    const radianAngle = this.angle * (Math.PI / 180) // Convert degree to radian

    const deltaX = distance * Math.cos(radianAngle)
    const deltaY = distance * Math.sin(radianAngle)

    this.$el.style.transform = `translate(${deltaX}px, ${deltaY}px)`

    setTimeout(() => {
      this.$el.classList.add('fade-out')
      // You can also remove the particle from DOM after the animation completes to keep things clean
      setTimeout(() => {
        this.$el.remove()
      }, 1000) // same duration as the CSS transition
    }, 10) // start the fade out almost immediately
  }
}
</script>

<style scoped>
.particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  transition: transform 1s, opacity 1s; /* transition over 1 second */
  opacity: 1; /* start fully visible */
}

.fade-out {
  opacity: 0; /* fade out over the duration of the transition */
}
</style>
