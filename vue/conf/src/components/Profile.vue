<script setup lang="ts">
import ProfileGeneralInfo from './ProfileGeneralInfo.vue'
import ProfileAchievement from './ProfileAchievement.vue'
</script>

<template>
  <article class="profile">
    <ProfileGeneralInfo />
    <section class="detailed-info">
      <div class="achievements">
          <h2 class="profile-title">achievements</h2>
        <div class="achievements-scrollview">
          <!-- todo: replace with foreach -->
          <ProfileAchievement
            :achievementType="1"
            :achievementTitle="'First Achievement'"
            :achievementDescription="'This is the first achievement'"
          />
          <ProfileAchievement
            :achievementType="6"
            :achievementTitle="'Last Achievement'"
            :achievementDescription="'This is the last achievement'"
          />
          <ProfileAchievement
            :achievementType="2"
            :achievementTitle="'Second Achievement'"
            :achievementDescription="'This is the second achievement'"
          />
        </div>
      </div>
      <div class="match-history">
        <h2 class="profile-title">match history</h2>
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
.achievements-scrollview {
  overflow-y: auto;
  max-height: 50vh;
}
.match-history {
  padding-left: 1.5rem;
}
</style>
