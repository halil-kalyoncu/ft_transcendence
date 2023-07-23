<template>
<section class="channels">
    <button class="channel-option-button" @click="openModal">Create Channel</button>
    <Modal
      :isOpened="isModalOpened"
      :title="'Create a Channel'"
      :placeholderText="'Enter channel name'"
      :showVisibilitySelection="true"
      @submit="handleConfirm" 
      @close="handleClose" 
    />
    <button class="channel-option-button">Join Channels</button>
    <button class="channel-option-button">My Channels</button>
  </section>
</template>

<script setup lang="ts">
import Chat from './Chat.vue'
import { computed, watch, ref } from 'vue'
import { useUserStore } from '../stores/username'
import Modal from './Modal.vue'

const userStore = useUserStore()
const username = computed(() => userStore.username)

interface ModalResult {
  name: string;
  password: string;
  visibility: string;
}

const isModalOpened = ref(false)
const openModal = () => {
  isModalOpened.value = true
}

const handleClose = () => {
  isModalOpened.value = false
}

const handleConfirm = ({name, password, visibility}: ModalResult) => {
  isModalOpened.value = false
  console.log(name, password, visibility) 
}
</script>

<style>
.channels {
  height: calc(100% - 50px);
  padding: 1.5rem 0.5rem 0.5rem 0.5rem;
}
.channel-option-button {
  font-family: 'Courier New', Courier, monospace !important;
  display: block;
  width: calc(100%);
  margin: 0 0 1rem 0;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  background: transparent;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.25s color ease-out, border 0.25s ease-out;
}

.channel-option-button:hover {
  color: aliceblue;
  border: 1px solid #ea9f42;
  font-weight: bold;
}
</style>
