<script setup lang="ts"></script>

<template>
  <div class="chat">
    <div class="messages"></div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message here..." />
      <button>Send</button>
    </div>
  </div>
</template>

<style>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat .messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 0 auto;
}

.chat .chat-input {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0.5rem;
  position: relative;
}

.chat .chat-input input {
  width: 100%;
  padding: 0.5rem 0.25rem;
  background-color: lightgray;
  border-radius: 0.25rem;
}

.chat .chat-input input:focus {
  outline: solid 2px #ea9f42;
}

.chat .chat-input button {
  position: absolute;
  right: 1rem;
  background-color: #ea9f42;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: 0.3s;
}

.chat .chat-input button:hover {
  background-color: #ed901c;
}
</style>
