<template>
  <div class="match-history-item">
    <section class="player-section">
      <img class="profile-image" :src="playerAvatar" alt="Player Profile" />
      <h2 class="profile-username">{{ playerName }}</h2>
    </section>

    <section class="result-section">
      <p :class="victory ? 'stat-wins' : 'stat-losses'">{{ victory ? 'Victory' : 'Defeat' }}</p>
      <p class="score">{{ score }}</p>
      <p class="date-time">{{ dateTime }}</p>
    </section>

    <section class="opponent-section">
      <img class="profile-image" :src="opponentAvatar" alt="Opponent Profile" />
      <h2 class="profile-username">{{ opponentName }}</h2>
    </section>
  </div>
</template>

<script setup lang="ts">

type Props = {
  score: string;
  victory: boolean;
  playerName: string;
  opponentName: string;
  playerAvatar: string;
  opponentAvatar: string;
  dateTime: string;
}

defineProps<Props>()
</script>

<style scoped>
.match-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: 0 1.5rem 1.5rem 0;
  border-radius: .25rem;
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

.match-history-item .profile-username{
    font-size: .8rem;
    color: #ffff00;
    text-align: center;
    margin: 0 .25rem;
}

.date-time {
  font-size: 0.8em;
  color: #aaa;
}

.result-section
.stat-wins,
.result-section
.stat-losses{
    font-size: 1.5rem;
    font-weight: bold;
}

</style>