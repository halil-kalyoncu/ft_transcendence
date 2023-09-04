<template>
  <div>
    <FriendsListItem
      @handle-block="handleBlockUser"
      @handle-unfriend="handleUnfriendUser"
      :username="selectedFriendEntry?.friend?.username ?? ''"
      :status="selectedFriendEntry?.status!"
      :showActions="true"
    />
    <button class="game-invite-button" @click="handleInvite">Invite to Game</button>
  </div>
</template>

<script setup lang="ts">
import FriendsListItem from './FriendsListItem.vue'
import { useNotificationStore } from '../../stores/notification'
import type { FriendshipEntryI } from '../../model/friendship/friendshipEntry.interface'

const notificationStore = useNotificationStore()

const props = defineProps({
  selectedFriendEntry: {
    type: Object as () => FriendshipEntryI | null,
    required: true
  }
})

const emit = defineEmits(['unfriend-user', 'block-user', 'invite-user-to-game'])

const handleBlockUser = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let blockUserId = props.selectedFriendEntry?.friend?.id
  emit('block-user', username, blockUserId)
}

const handleUnfriendUser = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let friendshipId = props.selectedFriendEntry?.id
  emit('unfriend-user', username, friendshipId)
}

const handleInvite = () => {
  let username = props.selectedFriendEntry?.friend?.username ?? ''
  let id = props.selectedFriendEntry?.id
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
