<template>
  <div class="leaderboardView">
    <h1>Leaderboard</h1>
    <ScrollViewer :maxHeight="'1000vh'" :paddingRight="'.5rem'">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th class="ladder-score">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in players" :key="index" @click="openProfile(player.id ?? 0)">
            <td>{{ player.username }}</td>
            <td class="ladder-score">{{ player.ladderLevel }}</td>
          </tr>
        </tbody>
      </table>
    </ScrollViewer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UserI } from '../../model/user.interface'
import router from '../../router'
import ScrollViewer from '../utils/ScrollViewer.vue'

import { useNotificationStore } from '../../stores/notification'

const notificationStore = useNotificationStore()

const players = ref<UserI[] | null>(null)

async function fetchUsers(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/get-all-users-by-ladder`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    if (response.ok) {
      players.value = responseData
    } else {
      notificationStore.showNotification(
        'Error while fetching users: ' + responseData.message,
        false
      )
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching users', false)
  }
}

function openProfile(userId: number): void {
  router.push(`/profile/${userId}`)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style>
.leaderboardView {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(100vh - 50.8px);
  margin-top: 20px;
  color: #fff;
  border-radius: 0.25rem;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: auto;
  background: rgba(0, 0, 0, 0.6);
  font-size: 20px;
  min-height: 650px;
  min-width: 700px;
}

table {
  border-collapse: collapse;
}

h1 {
  font-size: 2em;
}

h2 {
  font-family: 'Courier New', Courier, monospace;
  margin-bottom: 20px;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  padding: 20px 25px;
  text-align: left;
  border-bottom: 2px solid #ddd;
  color: #fff;
}

th {
  background-color: #e4a422;
  color: #333;
  font-size: 1.5em;
}

tr:hover {
  background-color: #555;
}

.ladder-score,
.ladder-score-header {
  text-align: right;
}

@media (max-width: 600px) {
  table,
  th,
  td {
    width: 100%;
    display: block;
  }

  th,
  td {
    border-bottom: 1px solid #ddd;
    padding-left: 50%;
    position: relative;
  }

  th::before {
    display: none;
  }

  td::before {
    content: attr(data-label);
    position: absolute;
    left: 0;
    width: 50%;
    padding-left: 15px;
    font-size: 15px;
    font-weight: bold;
    color: #ffdd1b;
  }
}
</style>
