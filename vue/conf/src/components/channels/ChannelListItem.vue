<template>
  <div class="available-channels-item">
    <div class="channel-info">
        <p class="channel-name">{{ channelName }}</p>
        <div class="channel-owner-container">
          <font-awesome-icon class="icon" :icon="['fas', 'user']" />
          <span class="channel-owner">{{ ownerName }}</span>
        </div>
    </div>
    <div class="channel-button-container">
      <font-awesome-icon v-if="isPasswordProtected" class="icon" :icon="['fas', 'lock']" />
         <button class="join-channel-button">{{ joinChannelButtonName }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)

const props = defineProps({
  isPasswordProtected: Boolean,
  channelName: String,
  ownerName: String,
  joinChannelButtonName: String
})
</script>

<style>
.available-channels-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', Courier, monospace !important;
  width: calc(100%);
  margin: 0 0 1rem 0;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  background: transparent;
  color: aliceblue;
  border: 0.5px solid aliceblue;
  cursor: pointer;
  transition: 0.25s color ease-out, border 0.25s ease-out;
}

.channel-button-container {
  display: flex;
  align-items: center;
}

.channel-button-container .icon {
  margin-right: 0.5rem;
  color: #c0c0c0;
  font-size: .75rem;
}

.channel-name {
  margin: 0;
  padding: 0;
  font-size: .9rem;
  font-weight: bold;
}

.channel-owner {
  margin: 0;
  padding: 0;
  font-size: .8rem;
  color: #ea9f42;
}

.join-channel-button {
  background: #428DEA;
  border: 0.5px solid aliceblue;
  font-size: 0.75rem;
  font-weight: light;
  color: #fff;
  box-sizing: border-box;
  padding: 0.25rem .5rem;
  cursor: pointer;
  transition: 0.125s background-color ease-out, border 0.25s ease-out;
}
.join-channel-button:hover {
  color: aliceblue;
  border: 0.5px solid #ea9f42;
  text-shadow: 0px 0px 1px aliceblue;
  background: #ea9f42;
}

.channel-info{
  display: flex;
  flex-direction: column;
}

.channel-owner-container {
  display: flex;
  align-items: center;
}

.channel-owner-container .icon {
  margin: 0 .5rem .25rem 0;
  color: #c0c0c0;
  font-size: .75rem;
}

</style>
