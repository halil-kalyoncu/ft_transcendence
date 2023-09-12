<!-- CHECK IN THE MUTED! -->
<template>
  <div v-if="isOpened" class="modal" @click="handleClickOutside">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">{{ title }}</h2>
      <div class="input-group">
        <input
          v-show="isNumberSelection"
          id="number-value"
          v-model="numberValue"
          type="number"
          :placeholder="placeholderText"
          max="100"
          min="0"
          class="input-text"
        />
        <input
          v-show="!isNumberSelection"
          id="input-name"
          v-model="inputName"
          :placeholder="placeholderText"
          type="text"
          class="input-text"
          required
        />
      </div>
      <div v-if="showVisibilitySelection && !isNumberSelection">
        <div class="radio-button-input-group">
          <input type="radio" id="Public" value="Public" v-model="channelVisibility" hidden />
          <label for="Public">Public </label>
          <!-- TODO: Change layout -->

          <input type="radio" id="Private" value="Private" v-model="channelVisibility" hidden />
          <label for="Private">Private</label>
        </div>
      </div>

      <div class="input-group" v-if="checkPassword">
        <input
          id="input-password"
          v-model="inputPassword"
          placeholder="Enter password"
          type="text"
          class="input-text"
        />
      </div>

      <div class="checkbox-container" v-if="!isNumberSelection">
        <label for="check-box">
          Password
          <input
            type="checkbox"
            id="check-box"
            v-model="checkPassword"
          />
        </label>
      </div>

      <div class="button-group">
        <button class="submit-button" @click="isNumberSelection ? submitNumber() : submit()">
          OK
        </button>
        <button class="cancel-button" @click="handleClickOutside">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotificationStore } from '../../stores/notification'

interface ModalResult {
  name?: string
  password?: string
  channelVisibility?: string
  minutesOfMute?: Number
  passwordSet?: boolean
}

const inputName = ref('')
const inputPassword = ref('')
const checkPassword = ref(false)
const numberValue = ref(0)
const maxValue = ref(100)
const channelVisibility = ref('Public')
const notificationStore = useNotificationStore()

const props = defineProps({
  isOpened: Boolean,
  title: String,
  placeholderText: String,
  showVisibilitySelection: Boolean,
  isNumberSelection: Boolean
})

const emit = defineEmits(['submit', 'close'])

const submit = () => {
  if (inputName.value.trim() === '') {
    notificationStore.showNotification('Set Channel-Name')
    return
  }
  if ( inputName.value.length > 15){
	notificationStore.showNotification('Channel-Name too long')
	return
  }
  if (checkPassword.value && inputPassword.value.trim() === '') {
    notificationStore.showNotification('Set Password')
    return
  }
  const result: ModalResult = {
    name: inputName.value,
    password: inputPassword.value,
    channelVisibility: channelVisibility.value,
    passwordSet: checkPassword.value
  }

  emit('submit', result)

  inputName.value = ''
  inputPassword.value = ''
  channelVisibility.value = 'Public'
}

const submitNumber = () => {
  const result: ModalResult = {
    minutesOfMute: numberValue.value
  }

  emit('submit', result)

  numberValue.value = 0
}

const handleClickOutside = () => {
  emit('close')
}

watch(numberValue, (newValue) => {
  if (newValue > maxValue.value) {
    numberValue.value = maxValue.value
  }
})
</script>
<style>
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  max-width: 350px;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #2c3e50;
  border: 0.25px solid darkgray;
  padding: 0.5rem 1rem 1rem;
  color: #ecf0f1;
}

.modal-content .input-text {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  background-color: #34495e;
  color: #ecf0f1;
}

.input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.input-group .label-input-field {
  min-width: 5rem;
  margin-bottom: 20px;
  margin-right: 0.5rem;
  display: block;
}

.modal-content input:focus {
  outline: solid 0.25px #ea9f42;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.radio-button-input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 1rem 0;
}

.radio-button-input-group label {
  padding: 0.25rem 1rem;
  border-bottom: 0.25px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease-out;
}

.radio-button-input-group label:hover {
  color: #ea9f42;
}

.radio-button-input-group input[type='radio']:checked + label {
  border-color: #ea9f42;
  color: #ea9f42;
}

.cancel-button,
.submit-button {
  padding: 0.25rem 1rem;
  border: none;
  color: #ecf0f1;
  min-width: 5rem;
  cursor: pointer;
  transition: all 0.25s ease-out;
}

.cancel-button {
  background-color: transparent;
  border: 0.25px solid #c0392b;
  color: #c0392b;
}

.cancel-button:hover {
  border: 0.25px solid #e74c3c;
  color: #e74c3c;
}

.submit-button {
  background-color: transparent;
  border: 0.25px solid #27ae60;
  color: #27ae60;
}

.submit-button:hover {
  border: 0.25px solid #2ecc71;
  color: #2ecc71;
}

.modal-title {
  text-align: left;
  color: aliceblue;
  font-size: 0.9rem;
  margin: 0 -1rem 1rem;
  padding: 0 1rem 0.5rem;
  border-bottom: 0.25px solid darkgray;
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 0.8rem;
}

.checkbox-container label {
  margin-right: 0.5rem;
  color: #ecf0f1;
  font-size: 0.7rem;
}

.checkbox-input {
  display: flex;
  align-items: center;
  margin-top: -0.2rem;
  width: 8px; /* Set the desired width */
  height: 8px;
}
</style>
