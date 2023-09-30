<template>
  <div class="match-history-item">
    <section class="left-player-section">
      <h2 class="profile-username">{{ leftPlayerName }}</h2>
    </section>
    <section class="result-section">
      <p class="score">{{ scoreMessage }}</p>
      <p class="goals">{{ combinedScore }}</p>
      <p class="date-time" v-if="time">{{ formattedTimestamp }}</p>
    </section>
    <section class="right-player-section">
      <h2 class="profile-username">{{ rightPlayerName }}</h2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { MatchI } from '../../model/match/match.interface'

const props = defineProps({
  match: {
    type: Object as () => MatchI | null,
    required: true
  },

  userId: String
})

const time: Date | null = props.match?.finishedAt ?? null
const leftPlayerName: string | null = props.match?.leftUser?.username ?? null
const rightPlayerName: string | null = props.match?.rightUser?.username ?? null

const scoreMessage = computed(() => {
  if (!props.match?.state || !props.userId) return null

  if (
    (props.match?.state === 'WINNERLEFT' && props.match?.leftUser?.id === parseInt(props.userId)) ||
    (props.match?.state === 'DISCONNECTRIGHT' &&
      props.match?.leftUser?.id === parseInt(props.userId)) ||
    (props.match?.state === 'WINNERRIGHT' &&
      props.match?.rightUser?.id === parseInt(props.userId)) ||
    (props.match?.state === 'DISCONNECTLEFT' &&
      props.match?.rightUser?.id === parseInt(props.userId))
  )
    return 'Win'
  return 'Defeat'
})

const combinedScore = computed(() => {
  const leftScore = props.match?.goalsLeftPlayer ?? 0
  const rightScore = props.match?.goalsRightPlayer ?? 0

  return `${leftScore} : ${rightScore}`
})

const formatDate = (createdAt: Date | null) => {
  if (!createdAt)
  	return '';

  const date = new Date(createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`
}

const formattedTimestamp = computed(() => formatDate(time ?? null));

</script>

<style scoped>
.match-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  opacity: 0.9;
  color: #fff;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: 0 1.5rem 1.5rem 0;
  border-radius: 0.25rem;
}

section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.score {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.match-history-item .profile-username {
  font-size: 0.8rem;
  color: #ffff00;
  text-align: center;
  margin: 0 0.25rem;
}

.date-time {
  font-size: 0.8em;
  color: #aaa;
}

.result-section .stat-wins,
.result-section .stat-losses {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
