<!-- TODO CHECK THE ROUTER! ID HAS THE USERNAME INSED USERNAME NOT DEFINED, CALL TO MATCHES NOT WORKING -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import ProfileGeneralInfo from './ProfileGeneralInfo.vue'
import ProfileAchievementItem from './ProfileAchievementItem.vue'
import ProfileMatchHistoryItem from './ProfileMatchHistoryItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import type { MatchI } from '../../model/match/match.interface'
import type { UserAchievementI } from '../../model/achievement/userAchievement.interface'
import type { UserI } from '../../model/user.interface'
import { useNotificationStore } from '../../stores/notification'

const profileExists = ref<boolean>(true)

const notificationStore = useNotificationStore()
const router = useRouter()
const route = ref(useRoute())
let userId = route.value.params.userId as string
let username = ref<string>('')
const wins = ref<number>(0)
const losses = ref<number>(0)
const ladderLevel = ref<number>(0)

const matchHistory = ref<MatchI[] | null>(null)
const achievements = ref<UserAchievementI[] | null>(null)

async function getMatchHistory(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matches/find-matches-by-user?userid=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
		  Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )
    if (response.ok) {
      const matchData = await response.json()

      matchHistory.value = matchData
    }
  } catch (error) {
    console.error('Failed to fetch match history:', error)
  }
}

async function getAchievments(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/achievement/get-user-achievements?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
		  Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )
    if (response.ok) {
      const matchData = await response.json()

      achievements.value = matchData
    }
  } catch (error) {
    console.error('Failed to fetch achievement history:', error)
  }
}

async function checkUserId(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/find-by-id?id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    if (response.ok) {
      const responseText = await response.text()
      const user: UserI | null = responseText ? JSON.parse(responseText) : null

      if (!user) {
        notificationStore.showNotification("Profile doesn't exists", false)
        profileExists.value = false
      }
      username.value = user?.username as string
      ladderLevel.value = user?.ladderLevel as number
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong during loading of profile', false)
    profileExists.value = false
  }
}

async function getMatchOutcomes(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matches/match-outcomes?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
		  Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )
    if (response.ok) {
      const outcomes = await response.json()
      wins.value = outcomes.wins
      losses.value = outcomes.losses
    }
  } catch (error) {
    console.error('Failed to fetch match outcomes:', error)
  }
}
onMounted(async () => {
  await checkUserId()
  if (profileExists.value === false) {
    router.push('/home')
  }

  getAchievments()
  getMatchHistory()
  getMatchOutcomes()
})

onBeforeUnmount(() => {
  unwatch()
})

const unwatch = watch(
  () => route.value.params.userId,
  async (newId) => {
    if (newId !== undefined) {
      userId = newId as string
      await checkUserId()
      getAchievments()
      getMatchHistory()
      getMatchOutcomes()
    }
  },
  {}
)
</script>

<template>
  <router-view :key="route.fullPath">
    <article class="profile">
      <ProfileGeneralInfo
        :username="username"
        :userid="userId"
        :ladderLevel="ladderLevel"
        :wins="wins"
        :losses="losses"
      />
      <section class="detailed-info">
        <div class="achievements">
          <h2 class="profile-title">achievements</h2>
          <ScrollViewer :maxHeight="'50vh'">
            <ProfileAchievementItem
              v-for="achievement in achievements"
              :key="achievement.id"
              :achievement="achievement"
            />
          </ScrollViewer>
        </div>
        <div class="match-history">
          <h2 class="profile-title">match history</h2>
          <ScrollViewer :maxHeight="'50vh'">
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
  </router-view>
</template>

<style>
.profile {
  width: 100%;
  height: calc(100vh - 50.8px);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  min-height: 650px;
  min-width: 700px;
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
