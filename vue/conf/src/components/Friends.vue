<script setup lang="ts" >
import Chat from './Chat.vue'
</script>

<template>
  <section class="friends">
    <div class="friendsList">
    <h1>Friends View</h1>
    </div>
    <Chat/>
  </section>
</template>


<style>
.friends {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px) ;
}

.channels > * {
  flex: 1;
}

</style>