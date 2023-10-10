<template>
  <div class="modal-overlay" v-show="visible">
    <div class="modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button @click="confirm">Confirm</button>
      <button @click="cancel">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: String,
  message: String,
  visible: Boolean
})

const { emit } = defineEmits()

const confirm = () => {
  emit('confirmed')
}

const cancel = () => {
  emit('cancelled')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}
</style>
