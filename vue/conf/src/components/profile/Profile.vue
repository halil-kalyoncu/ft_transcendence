<!-- TODO CHECK THE ROUTER! ID HAS THE USERNAME INSED USERNAME NOT DEFINED, CALL TO MATCHES NOT WORKING -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProfileGeneralInfo from './ProfileGeneralInfo.vue'
import ProfileAchievementItem from './ProfileAchievementItem.vue'
import ProfileMatchHistoryItem from './ProfileMatchHistoryItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useRoute } from 'vue-router'
import type { MatchI } from '../../model/match/match.interface'
import type { AchievementI } from '../../model/achievement/achievement.interface'
import type { UserAchievementI } from '../../model/achievement/userAchievement.interface'

const route = ref(useRoute())
let userId = route.value.params.userId as string

// let userId = ref<number>(0)

// const props = defineProps<{
//   username: string;
// }>();

watch(() => route, (newVal, oldVal) => {
  if(newVal){
	userId = newVal.value.params.userId as string
	console.log('userId', userId)

     }});

const matchHistory = ref<MatchI[] | null>(null)
const achievements = ref<UserAchievementI[] | null>(null)

async function getMatchHistory(): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/matches/find-matches-by-user?userid=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    // console.log("RESPONSE:", userId.value)
    if (response.ok) {
      const matchData = await response.json()

      matchHistory.value = matchData

      console.log('RESPONSE:', matchData)
    }
  } catch (error) {
    console.error('Failed to fetch match history:', error)
  }
}

async function getAchievments(): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/achievement/get-user-achievements?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    // console.log("RESPONSE:", userId.value)
    if (response.ok) {
      const matchData = await response.json()

      achievements.value = matchData

      console.log('RESPONSE:', matchData)
    }
  } catch (error) {
    console.error('Failed to fetch achievement history:', error)
  }
}

onMounted(() => {
  getMatchHistory()
  getAchievments()
})
</script>

<template>
  <article class="profile">
    <ProfileGeneralInfo :username="userId" />
    <section class="detailed-info">
      <div class="achievements">
        <h2 class="profile-title">achievements</h2>
        <ScrollViewer :maxHeight="'67vh'">
          <ProfileAchievementItem
            v-for="achievement in achievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </ScrollViewer>
      </div>
      <div class="match-history">
        <h2 class="profile-title">match history</h2>
        <ScrollViewer :maxHeight="'67vh'">
          <ProfileMatchHistoryItem
            v-for="match in matchHistory"
            :key="match.id"
            :match="match"
            :userId="userId"
          />
        </ScrollViewer>
      </div>
    </section>
  </article>
</template>

<style>
.profile {
  width: 100%;
  height: calc(100vh - 50.8px);
  background: rgba(0, 0, 0, 0.6);
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
  font-size: 1rem;
  color: #ea9f42;
  font-family: 'Gill Sans', sans-serif;
  text-align: Center;
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
