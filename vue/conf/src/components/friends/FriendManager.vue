<template>
  <div>
    <FriendsListItem
      @handle-block="handleBlockUser"
      @handle-unblock="handleUnblockUser"
      @handle-unfriend="handleUnfriendUser"
      :username="selectedFriendEntry?.friend?.username ?? ''"
      :userid="selectedFriendEntry?.friend?.id ?? 0"
      :status="selectedFriendEntry?.status!"
      :blocked="selectedFriendEntry?.blocked!"
      :showActions="true"
    />
    <button class="game-invite-button" @click="handleInvite">Invite to Game</button>
  </div>
</template>

<script setup lang="ts">
import FriendsListItem from './FriendsListItem.vue'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'

const props = defineProps({
  selectedFriendEntry: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const emit = defineEmits(['unfriend-user', 'block-user', 'unblock-user', 'invite-user-to-game'])

const handleBlockUser = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let blockUserId = props.selectedFriendEntry?.friend?.id
  emit('block-user', username, blockUserId)
}

const handleUnblockUser = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let unblockUserId = props.selectedFriendEntry?.friend?.id
  emit('unblock-user', username, unblockUserId)
}

const handleUnfriendUser = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let friendshipId = props.selectedFriendEntry?.id
  emit('unfriend-user', username, friendshipId)
}

const handleInvite = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let id = props.selectedFriendEntry?.friend?.id ?? 0
  emit('invite-user-to-game', username, id)
}
</script>

<style>
.game-invite-button {
  background-color: #32a852;
  border: none;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 0.9rem;
  transition-duration: 0.4s;
  width: 100%;
  cursor: pointer;
  text-align: center;
  margin: 0.5rem auto 0;
  display: block;
}

.game-invite-button:hover {
  background-color: #005600;
  color: white;
}
</style>
