<script setup lang="ts">
import ProfileGeneralInfo from './ProfileGeneralInfo.vue'
import ProfileAchievementItem from './ProfileAchievementItem.vue'
import ProfileMatchHistoryItem from './ProfileMatchHistoryItem.vue'
</script>

<template>
  <article class="profile">
    <ProfileGeneralInfo />
    <section class="detailed-info">
      <div class="achievements">
        <h2 class="profile-title">achievements</h2>
        <div class="achievements-scrollview">
          <!-- todo: replace with foreach -->
          <ProfileAchievementItem
            :achievementType="1"
            :achievementTitle="'First Achievement'"
            :achievementDescription="'This is the first achievement'"
          />
          <ProfileAchievementItem
            :achievementType="6"
            :achievementTitle="'Last Achievement'"
            :achievementDescription="'This is the last achievement'"
          />
          <ProfileAchievementItem
            :achievementType="2"
            :achievementTitle="'Second Achievement'"
            :achievementDescription="'This is the second achievement'"
          />
        </div>
      </div>
      <div class="match-history">
        <h2 class="profile-title">match history</h2>
        <div class="match-history-scrollview">
          <!-- todo: replace with foreach -->
          <ProfileMatchHistoryItem
            :score="'5 : 3'"
            :victory="true"
            :playerName="'username'"
            :opponentName="'Opponent 1'"
            :dateTime="'2023/07/16 11:11'"
            :playerAvatar="'src/assets/avatar-1.png'"
            :opponentAvatar="'src/assets/avatar-2.png'"
          />
          <ProfileMatchHistoryItem
            :score="'1 : 5'"
            :victory="false"
            :playerName="'username'"
            :opponentName="'Opponent 2'"
            :dateTime="'2023/07/16 11:11'"
            :playerAvatar="'src/assets/avatar-1.png'"
            :opponentAvatar="'src/assets/avatar-3.png'"
          />
          <ProfileMatchHistoryItem
            :score="'5 : 4'"
            :victory="true"
            :playerName="'username'"
            :opponentName="'Opponent 2'"
            :dateTime="'2023/07/16 11:11'"
            :playerAvatar="'src/assets/avatar-1.png'"
            :opponentAvatar="'src/assets/avatar-3.png'"
          />
          <ProfileMatchHistoryItem
            :score="'5 : 0'"
            :victory="true"
            :playerName="'username'"
            :opponentName="'Opponent 1'"
            :dateTime="'2023/07/16 11:11'"
            :playerAvatar="'src/assets/avatar-1.png'"
            :opponentAvatar="'src/assets/avatar-2.png'"
          />
        </div>
      </div>
    </section>
  </article>
</template>

<style>
.profile {
  width: 100%;
  height: calc(100vh - 50.8px);
  background-color: #171717;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.detailed-info {
  flex: 2;
  display: flex;
  flex-direction: row;
}

.detailed-info .achievements {
  flex: 2;
}

.detailed-info .match-history {
  flex: 2;
}

.profile-title {
  text-transform: uppercase;
  font-size: 1.5rem;
  color: darkgray;
  font-family: 'Gill Sans', sans-serif;
  margin: 0 0 1rem 0;
}

.achievements {
  border-right: 0.25px solid darkgray;
}

.achievements-scrollview,
.match-history-scrollview {
  overflow-y: auto;
  max-height: 50vh;
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #303030;
}

.achievements-scrollview::-webkit-scrollbar,
.match-history-scrollview::-webkit-scrollbar {
  width: 8px;
}

.achievements-scrollview::-webkit-scrollbar-track,
.match-history-scrollview::-webkit-scrollbar-track {
  background-color: #303030;
  border-radius: 10px;
}

.achievements-scrollview::-webkit-scrollbar-thumb,
.match-history-scrollview::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}
.match-history {
  padding-left: 1.5rem;
}
</style>
